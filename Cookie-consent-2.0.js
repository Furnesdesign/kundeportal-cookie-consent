document.addEventListener('DOMContentLoaded', function () {
  // ===== Query UI elements (custom attributes) =====
  const consentModal = document.querySelector('[cc="preferences"]');
  const denyAllButton = document.querySelector('[cc="deny"]');
  const allowAllButton = document.querySelector('[cc="allow"]');
  const submitButton = document.querySelector('[cc="submit"]');
  const closeButtons = document.querySelectorAll('[cc="close"]');
  const openPreferencesButton = document.querySelector('[cc="open-preferences"]');

  const marketingCheckbox = document.querySelector('[cc-checkbox="marketing"]');
  const functionalCheckbox = document.querySelector('[cc-checkbox="functional"]');
  const analyticsCheckbox  = document.querySelector('[cc-checkbox="analytics"]');

  // ===== Helpers: localStorage =====
  function setConsentValue(name, value) {
    localStorage.setItem(name, value);
    console.log(`localStorage set: ${name} = ${value}`);
  }
  function getConsentValue(name) {
    return localStorage.getItem(name);
  }
  function areAllValuesSet() {
    const f = getConsentValue('functional_consent');
    const m = getConsentValue('marketing_consent');
    const a = getConsentValue('analytics_consent');
    return f !== null && m !== null && a !== null;
  }

  // ===== Consent signallers =====
  // Google Consent Mode v2 via gtag shim (GTM)
  function sendGoogleConsent(functional, marketing, analytics) {
    // Ensure gtag exists
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ dataLayer.push(arguments); };

    // Map your toggles to Consent Mode signals
    gtag('consent', 'update', {
      ad_storage:           marketing ? 'granted' : 'denied',
      ad_user_data:         marketing ? 'granted' : 'denied',
      ad_personalization:   marketing ? 'granted' : 'denied',
      analytics_storage:    analytics ? 'granted' : 'denied',
      functionality_storage:functional ? 'granted' : 'denied',
      // security_storage typically remains granted as strictly necessary
    });

    // Optional: push your own diagnostic event
    dataLayer.push({
      event: 'update_consent_status_v2',
      functional: !!functional,
      marketing:  !!marketing,
      analytics:  !!analytics
    });

    console.log('[ConsentMode] Updated:',
      {functional, marketing, analytics});
  }

  // Microsoft Clarity Consent API v2
  function sendClarityConsent(marketing, analytics) {
    if (typeof window.clarity === 'function') {
      window.clarity('consentv2', {
        ad_Storage:        marketing ? 'granted' : 'denied',
        analytics_Storage: analytics ? 'granted' : 'denied'
      });
      console.log('[Clarity] consentv2 sent:',
        { ad_Storage: marketing ? 'granted' : 'denied',
          analytics_Storage: analytics ? 'granted' : 'denied' });
    } else {
      console.warn('[Clarity] clarity() not found at time of call.');
    }
  }

  // Convenience: single sync to both stacks
  function syncAllConsents(functional, marketing, analytics) {
    sendGoogleConsent(functional, marketing, analytics);
    sendClarityConsent(marketing, analytics);
  }

  // ===== Initialize modal state & checkboxes =====
  function initializeModal() {
    const functionalConsent = getConsentValue('functional_consent') === 'true';
    const marketingConsent  = getConsentValue('marketing_consent')  === 'true';
    const analyticsConsent  = getConsentValue('analytics_consent')  === 'true';

    if (functionalCheckbox) functionalCheckbox.checked = functionalConsent;
    if (marketingCheckbox)  marketingCheckbox.checked  = marketingConsent;
    if (analyticsCheckbox)  analyticsCheckbox.checked  = analyticsConsent;

    // Show modal if user hasn't made a choice yet
    if (!areAllValuesSet() && consentModal) {
      console.log('[Consent] No prior consent found → opening modal');
      consentModal.style.display = 'flex';
    } else {
      // If user previously chose, sync consent signals on load
      syncAllConsents(functionalConsent, marketingConsent, analyticsConsent);
    }
  }

  // ===== Button handlers =====
  if (denyAllButton) {
    denyAllButton.addEventListener('click', function () {
      setConsentValue('functional_consent', false);
      setConsentValue('marketing_consent',  false);
      setConsentValue('analytics_consent',  false);

      updateCheckboxStates(false, false, false);
      syncAllConsents(false, false, false);
      closeConsentModal();
    });
  }

  if (allowAllButton) {
    allowAllButton.addEventListener('click', function () {
      setConsentValue('functional_consent', true);
      setConsentValue('marketing_consent',  true);
      setConsentValue('analytics_consent',  true);

      updateCheckboxStates(true, true, true);
      syncAllConsents(true, true, true);
      closeConsentModal();
    });
  }

  if (submitButton) {
    submitButton.addEventListener('click', function () {
      const functional = !!(functionalCheckbox && functionalCheckbox.checked);
      const marketing  = !!(marketingCheckbox  && marketingCheckbox.checked);
      const analytics  = !!(analyticsCheckbox  && analyticsCheckbox.checked);

      setConsentValue('functional_consent', functional);
      setConsentValue('marketing_consent',  marketing);
      setConsentValue('analytics_consent',  analytics);

      updateCheckboxStates(functional, marketing, analytics);
      syncAllConsents(functional, marketing, analytics);
      closeConsentModal();
    });
  }

  closeButtons.forEach(function (btn) {
    btn.addEventListener('click', closeConsentModal);
  });

  if (openPreferencesButton) {
    openPreferencesButton.addEventListener('click', function () {
      if (consentModal) consentModal.style.display = 'flex';
    });
  }

  // ===== Checkbox sync helper =====
  function updateCheckboxStates(functional, marketing, analytics) {
    if (functionalCheckbox) functionalCheckbox.checked = functional;
    if (marketingCheckbox)  marketingCheckbox.checked  = marketing;
    if (analyticsCheckbox)  analyticsCheckbox.checked  = analytics;
  }

  // ===== Modal close =====
  function closeConsentModal() {
    if (consentModal) consentModal.style.display = 'none';
  }

  // ===== Init on load =====
  initializeModal();
});
