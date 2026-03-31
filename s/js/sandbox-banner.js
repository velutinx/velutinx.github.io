// Sandbox Mode Banner – shows only when environment is sandbox or sandmode
(function() {
    const WORKER_URL = 'https://paypal-checkout-website.velutinx.workers.dev';

    async function shouldShowBanner() {
        try {
            const res = await fetch(`${WORKER_URL}/api/config`);
            if (!res.ok) return false;
            const config = await res.json();
            const env = config.environment;
            // Accept 'sandbox' or 'sandmode' (typo in some setups)
            return env === 'sandbox' || env === 'sandmode';
        } catch (err) {
            console.warn('Failed to fetch config, hiding banner:', err);
            return false;
        }
    }

    async function initBanner() {
        const show = await shouldShowBanner();
//        console.log('Banner should show:', show); // helpful debug
        const banner = document.querySelector('.sandbox-banner');
        if (!banner) {
            console.warn('Banner element not found');
            return;
        }

        if (!show) {
            banner.remove();
  //          console.log('Banner removed');
            return;
        }

        // Banner should be shown – run the animation
        const ticker = banner.querySelector('.ticker');
        const messageSpan = banner.querySelector('.text');
        if (!ticker || !messageSpan) return;

        let screenWidth = window.innerWidth;
        let textWidth = messageSpan.offsetWidth;
        let pos = screenWidth;               // start off‑screen right
        const speed = 2.5;
        let isPaused = false;
        let hasPausedThisCycle = false;
        let animationId = null;

        function updateDimensions() {
            screenWidth = window.innerWidth;
            textWidth = messageSpan.offsetWidth;
        }

        function animate() {
            const centerPoint = (screenWidth / 2) - (textWidth / 2);

            if (!isPaused) {
                pos -= speed;
            }

            if (!hasPausedThisCycle && pos <= centerPoint) {
                pos = centerPoint;
                isPaused = true;
                hasPausedThisCycle = true;
                setTimeout(() => {
                    isPaused = false;
                }, 3000);
            }

            if (pos <= -textWidth) {
                pos = screenWidth;
                hasPausedThisCycle = false;
            }

            ticker.style.transform = `translateX(${pos}px)`;
            animationId = requestAnimationFrame(animate);
        }

        function onResize() {
            updateDimensions();
            pos = screenWidth;
            hasPausedThisCycle = false;
            isPaused = false;
        }

        updateDimensions();
        animate();

        window.addEventListener('resize', onResize);

        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                if (animationId) cancelAnimationFrame(animationId);
            } else {
                animate();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBanner);
    } else {
        initBanner();
    }
})();
