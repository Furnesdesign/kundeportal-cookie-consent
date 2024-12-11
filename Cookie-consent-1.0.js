    document.addEventListener('DOMContentLoaded', function() {
        // Get modal, buttons, and checkboxes by their custom attributes (CA)
        const consentModal = document.querySelector('[cc="preferences"]');
        const denyAllButton = document.querySelector('[cc="deny"]');
        const allowAllButton = document.querySelector('[cc="allow"]');
        const submitButton = document.querySelector('[cc="submit"]');
        const closeButtons = document.querySelectorAll('[cc="close"]'); // Close buttons (NodeList of multiple buttons)
        const openPreferencesButton = document.querySelector('[cc="open-preferences"]');
        const marketingCheckbox = document.querySelector('[cc-checkbox="marketing"]');
        const functionalCheckbox = document.querySelector('[cc-checkbox="functional"]');
        const analyticsCheckbox = document.querySelector('[cc-checkbox="analytics"]');

        // Helper function to set consent in localStorage
        function setConsentValue(name, value) {
            localStorage.setItem(name, value);
            console.log(`localStorage set: ${name} = ${value}`);
        }

        // Function to get consent value from localStorage
        function getConsentValue(name) {
            return localStorage.getItem(name);
        }

        // Function to check if all consent values are set
        function areAllValuesSet() {
            const functional = getConsentValue("functional_consent");
            const marketing = getConsentValue("marketing_consent");
            const analytics = getConsentValue("analytics_consent");
            console.log(`Consent check - Functional: ${functional}, Marketing: ${marketing}, Analytics: ${analytics}`);
            // Return true if all three values are set (not null)
            return functional !== null && marketing !== null && analytics !== null;
        }

        // Initialize the modal state and checkboxes based on localStorage values
        function initializeModal() {
            const functionalConsent = getConsentValue("functional_consent") === "true";
            const marketingConsent = getConsentValue("marketing_consent") === "true";
            const analyticsConsent = getConsentValue("analytics_consent") === "true";

            // Set checkbox states based on the localStorage values
            if (functionalCheckbox) {
                functionalCheckbox.checked = functionalConsent;
            }
            if (marketingCheckbox) {
                marketingCheckbox.checked = marketingConsent;
            }
            if (analyticsCheckbox) {
                analyticsCheckbox.checked = analyticsConsent;
            }

            // Show the modal if none of the consent choices have been made yet
            if (!areAllValuesSet() && consentModal) {
                console.log("No consent found, showing the modal");
                consentModal.style.display = 'flex';
            }

            // Push current consent values to the dataLayer
            updateDataLayer(functionalConsent, marketingConsent, analyticsConsent);
        }

        // "Deny All" Button Action
        denyAllButton.addEventListener('click', function() {
            setConsentValue('functional_consent', false);
            setConsentValue('marketing_consent', false);
            setConsentValue('analytics_consent', false);
            updateDataLayer(false, false, false);
            updateCheckboxStates(false, false, false);
            closeConsentModal();
        });

        // "Allow All" Button Action
        allowAllButton.addEventListener('click', function() {
            setConsentValue('functional_consent', true);
            setConsentValue('marketing_consent', true);
            setConsentValue('analytics_consent', true);
            updateDataLayer(true, true, true);
            updateCheckboxStates(true, true, true);
            closeConsentModal();
        });

        // "Save and Submit" Button Action
        submitButton.addEventListener('click', function() {
            const consentValues = {
                functional: functionalCheckbox.checked,
                marketing: marketingCheckbox.checked,
                analytics: analyticsCheckbox.checked
            };
            setConsentValue('functional_consent', consentValues.functional);
            setConsentValue('marketing_consent', consentValues.marketing);
            setConsentValue('analytics_consent', consentValues.analytics);
            updateDataLayer(consentValues.functional, consentValues.marketing, consentValues.analytics);
            closeConsentModal();
        });

        // Close modal buttons
        closeButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                closeConsentModal();
            });
        });

        // "Open Preferences" Button Action
        openPreferencesButton.addEventListener('click', function() {
            if (consentModal) {
                consentModal.style.display = 'flex';
            }
        });

        // Update GTM dataLayer with consent status
        function updateDataLayer(functional, marketing, analytics) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'update_consent_status',
                'functional': functional,
                'marketing': marketing,
                'analytics': analytics
            });
            console.log(`Data Layer updated: functional = ${functional}, marketing = ${marketing}, analytics = ${analytics}`);
        }

        // Update checkbox states
        function updateCheckboxStates(functional, marketing, analytics) {
            if (functionalCheckbox) {
                functionalCheckbox.checked = functional;
            }
            if (marketingCheckbox) {
                marketingCheckbox.checked = marketing;
            }
            if (analyticsCheckbox) {
                analyticsCheckbox.checked = analytics;
            }
        }

        // Close consent modal
        function closeConsentModal() {
            if (consentModal) {
                consentModal.style.display = 'none';
            }
        }

        // Initialize the modal and checkbox states on page load
        initializeModal();
    });
