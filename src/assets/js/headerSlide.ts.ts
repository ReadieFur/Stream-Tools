import { Main } from "./main.ts.js";

export class HeaderSlide
{
    private header!: HTMLElement;

    constructor()
    {
        window.addEventListener("load", () => { this.WindowLoadEvent(); });
    }

    private WindowLoadEvent()
    {
        let style: HTMLStyleElement = document.createElement("style");
        style.innerHTML = `
            #header
            {
                transition: top ease 100ms, background-color ease 100ms;
                position: fixed;
                background-color: rgb(var(--backgroundAlt)) !important;
            }

            .dropdownContent > :last-child { background-color: rgba(var(--background), 0.5) !important; }

            .slideMenuClick
            {
                user-select: none; cursor: pointer;
            }
        `;
        document.head.appendChild(style);

        this.header = Main.ThrowIfNullOrUndefined(document.querySelector("#header"));
        this.header.addEventListener("mouseleave", () => { this.hideHeader(); });
        this.hideHeader();

        document.querySelectorAll(".slideMenu").forEach(e => { e.addEventListener("click", () => { this.showHeader(); }); });
    }

    private showHeader() { this.header.style.top = "0px"; }
    private hideHeader() { this.header.style.top = "-100px"; }
}