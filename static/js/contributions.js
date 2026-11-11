(() => {
    const chart = document.getElementById("contributions-chart");
    const status = document.getElementById("contributions-status");
    const legend = document.getElementById("contributions-legend");
    if (!chart || !status || !legend) return;

    const svgNamespace = "http://www.w3.org/2000/svg";
    const dayInMilliseconds = 86400000;
    const monthFormat = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" });
    const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" });

    const svgElement = (tag, attributes, text) => {
        const element = document.createElementNS(svgNamespace, tag);
        for (const [name, value] of Object.entries(attributes)) {
            element.setAttribute(name, value);
        }
        if (text !== undefined) element.textContent = text;
        return element;
    };

    const render = (contributions) => {
        if (!Array.isArray(contributions) || !contributions.length) {
            throw new Error("No contribution data available");
        }

        const days = contributions.map((day) => {
            const date = new Date(`${day.date}T00:00:00Z`);
            if (!Number.isFinite(date.getTime()) || !Number.isInteger(day.count) || day.count < 0 ||
                !Number.isInteger(day.level) || day.level < 0 || day.level > 4) {
                throw new Error("Invalid contribution data");
            }
            return { ...day, date };
        }).sort((a, b) => a.date - b.date);

        // Use UTC and start on Sunday to keep the calendar aligned in every time zone.
        const start = days[0].date.getTime() - days[0].date.getUTCDay() * dayInMilliseconds;
        const weeks = Math.floor((days[days.length - 1].date - start) / dayInMilliseconds / 7) + 1;
        const total = days.reduce((sum, day) => sum + day.count, 0);
        const summary = `${total.toLocaleString()} contributions in the last year`;
        const svg = svgElement("svg", {
            viewBox: `0 0 ${28 + weeks * 12} 104`,
            role: "img",
            "aria-label": summary,
        });
        svg.append(svgElement("title", {}, summary));

        for (const [row, label] of [[1, "Mon"], [3, "Wed"], [5, "Fri"]]) {
            svg.append(svgElement("text", { x: 0, y: 28 + row * 12 }, label));
        }

        let lastMonthColumn = -3;
        for (const day of days) {
            const column = Math.floor((day.date - start) / dayInMilliseconds / 7);
            const x = 28 + column * 12;
            if (day.date.getUTCDate() === 1 && column - lastMonthColumn >= 3 && column < weeks - 2) {
                svg.append(svgElement("text", { x, y: 10 }, monthFormat.format(day.date)));
                lastMonthColumn = column;
            }

            const cell = svgElement("rect", {
                x,
                y: 20 + day.date.getUTCDay() * 12,
                width: 9,
                height: 9,
                rx: 2,
                class: "contribution-day",
                "data-level": day.level,
            });
            const count = `${day.count} contribution${day.count === 1 ? "" : "s"}`;
            cell.append(svgElement("title", {}, `${count} on ${dateFormat.format(day.date)}`));
            svg.append(cell);
        }

        chart.replaceChildren(svg);
        chart.hidden = false;
        legend.hidden = false;
        status.textContent = summary;
        // Show the most recent activity first when the calendar overflows on mobile.
        chart.scrollLeft = chart.scrollWidth;
    };

    const load = async () => {
        status.textContent = "Loading contributions…";
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
            // Public contribution data; no GitHub token is needed in this static site.
            const response = await fetch("https://github-contributions-api.jogruber.de/v4/andrefetch?y=last", {
                signal: controller.signal,
            });
            if (!response.ok) throw new Error("Unable to load contributions");
            const data = await response.json();
            render(data.contributions);
        } catch {
            status.textContent = "Contributions are unavailable right now. View them on GitHub above.";
        } finally {
            clearTimeout(timeout);
        }
    };

    load();
})();
