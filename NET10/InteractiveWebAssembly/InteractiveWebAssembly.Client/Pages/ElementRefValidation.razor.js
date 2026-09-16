const formSelector = "#validation-contact-form";
const highlightedClass = "interop-highlight";

export function findNextEmptyCapturedField() {
    const fields = document.querySelectorAll(`${formSelector} [data-validation-candidate]`);
    return Array.from(fields).find(field => field.value.trim().length === 0) ?? null;
}

export function getUncapturedField() {
    return document.querySelector("#uncaptured-field");
}

export function highlightField(element) {
    clearHighlight();
    element.classList.add(highlightedClass);
    element.focus();
    return element.dataset.fieldLabel ?? element.getAttribute("aria-label") ?? element.id;
}

export function clearHighlight() {
    document.querySelectorAll(`.${highlightedClass}`).forEach(element => {
        element.classList.remove(highlightedClass);
    });
}