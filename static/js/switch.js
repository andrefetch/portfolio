(() => {
    const storageKey = "portfolio-theme";
    const root = document.documentElement;
    let theme = "dark";

    try {
        if (localStorage.getItem(storageKey) === "light") {
            theme = "light";
        }
    } catch {
        // The toggle still works when browser storage is unavailable.
    }

    // Restore the theme before the page renders to avoid a flash of dark mode.
    root.dataset.theme = theme;

    document.addEventListener("DOMContentLoaded", () => {
        const button = document.getElementById("theme-toggle");
        if (!button) return;

        const updateLabel = () => {
            const label = `Switch to ${theme === "dark" ? "light" : "dark"} mode`;
            button.setAttribute("aria-label", label);
            button.title = label;
        };

        updateLabel();

        button.addEventListener("click", () => {
            theme = theme === "dark" ? "light" : "dark";
            root.dataset.theme = theme;
            updateLabel();

            try {
                localStorage.setItem(storageKey, theme);
            } catch {
                // Keep the selected theme for this visit even without storage.
            }
        });
    });
})();
