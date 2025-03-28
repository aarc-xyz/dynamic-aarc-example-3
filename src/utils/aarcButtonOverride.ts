import { AarcFundKitModal } from "@aarc-xyz/fundkit-web-sdk";

let currentInterval: ReturnType<typeof setInterval> | null = null;

export const setupAarcButtonOverride = (aarcModal: AarcFundKitModal, dynamicAddress: string, options = { debug: false }) => {
    const { debug = false } = options;

    // Function to find elements in shadow DOM
    const findButtonInShadowDOM = (root: Document | ShadowRoot): { button: HTMLElement | null; backdrop: HTMLElement | null } => {
        let foundButton: HTMLElement | null = null;
        let foundBackdrop: HTMLElement | null = null;

        const shadows = root.querySelectorAll('*');
        for (const element of shadows) {
            if (element.shadowRoot) {
                // Look for the deposit button and backdrop
                const button = element.shadowRoot.querySelector('[data-testid="buy-crypto-button"]');
                const backdrop = element.shadowRoot.querySelector('[data-testid="portal-backdrop"]');

                if (button) {
                    foundButton = button as HTMLElement;
                }
                if (backdrop) {
                    foundBackdrop = backdrop as HTMLElement;
                }

                if (foundButton && foundBackdrop) {
                    return { button: foundButton, backdrop: foundBackdrop };
                }

                const deepResult = findButtonInShadowDOM(element.shadowRoot);
                if (deepResult.button) foundButton = deepResult.button;
                if (deepResult.backdrop) foundBackdrop = deepResult.backdrop;

                if (foundButton && foundBackdrop) {
                    return { button: foundButton, backdrop: foundBackdrop };
                }
            }
        }
        return { button: foundButton, backdrop: foundBackdrop };
    };

    // Function to setup the button override
    const setupOverride = () => {
        const { button, backdrop } = findButtonInShadowDOM(document);

        if (button) {
            if (debug) console.log('Found buy crypto button');

            // Always enable the button
            button.classList.remove('disabled');
            button.removeAttribute('disabled');
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';

            // Only add click handler if it hasn't been added yet
            if (!button.hasAttribute('data-aarc-override')) {
                // Mark this button as overridden
                button.setAttribute('data-aarc-override', 'true');

                // Create new button with our handler
                const newButton = button.cloneNode(true) as HTMLElement;
                newButton.setAttribute('data-aarc-override', 'true');
                newButton.classList.remove('disabled');
                newButton.removeAttribute('disabled');
                newButton.style.pointerEvents = 'auto';
                newButton.style.opacity = '1';

                // Add our new click handler
                const handleClick = (event: MouseEvent) => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();

                    if (debug) console.log('Opening Aarc modal');
                    // First close the Dynamic widget using the backdrop
                    if (backdrop) {
                        backdrop.click();
                    }
                    aarcModal?.updateDestinationWalletAddress(dynamicAddress);
                    // Small delay to ensure the Dynamic modal is closed
                    setTimeout(() => {
                        aarcModal.openModal();
                    }, 100);
                };

                newButton.addEventListener('click', handleClick, true);
                button.parentNode?.replaceChild(newButton, button);
            }
        }
    };

    // Clear existing interval if any
    if (currentInterval) {
        clearInterval(currentInterval);
    }

    // Continuously poll to maintain the override
    currentInterval = setInterval(() => {
        setupOverride();
    }, 100); // Check frequently to catch any changes

    // Return cleanup function
    return () => {
        if (currentInterval) {
            clearInterval(currentInterval);
            currentInterval = null;
        }
    };
}; 