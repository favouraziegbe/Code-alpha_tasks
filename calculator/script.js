
  
/* ========================================
   1. SELECT HTML ELEMENTS
======================================== */

const currentOperand = document.getElementById("current-operand");
const previousOperand = document.getElementById("previous-operand");
const livePreview = document.getElementById("live-preview");

const buttons = document.querySelector(".buttons");


/* ========================================
   2. CALCULATOR STATE
======================================== */

let currentValue = "0";
let previousValue = "";

let selectedOperator = null;

let shouldResetDisplay = false;

let lastOperator = null;
let lastOperand = null;


/* ========================================
   3. FORMAT NUMBERS
======================================== */

function formatNumber(number) {

    if (!Number.isFinite(number)) {
        return "Error";
    }

    return String(Number(number.toPrecision(10)));
}


/* ========================================
   4. PERFORM MATHEMATICAL OPERATIONS
======================================== */

function performOperation(firstNumber, secondNumber, operator) {

    switch (operator) {

        case "+":
            return firstNumber + secondNumber;

        case "-":
            return firstNumber - secondNumber;

        case "*":
            return firstNumber * secondNumber;

        case "/":

            if (secondNumber === 0) {
                return null;
            }

            return firstNumber / secondNumber;

        default:
            return null;
    }

}


/* ========================================
   5. LIVE CALCULATION PREVIEW
======================================== */

function calculatePreview() {

    if (!selectedOperator || shouldResetDisplay) {
        livePreview.textContent = "";
        return;
    }

    const firstNumber = Number(previousValue);
    const secondNumber = Number(currentValue);

    const result = performOperation(
        firstNumber,
        secondNumber,
        selectedOperator
    );

    if (result === null || !Number.isFinite(result)) {
        livePreview.textContent = "";
        return;
    }

    livePreview.textContent = `= ${formatNumber(result)}`;

}


/* ========================================
   6. UPDATE THE DISPLAY
======================================== */

function updateDisplay() {

    currentOperand.textContent = currentValue;

    previousOperand.textContent = selectedOperator
        ? `${previousValue} ${selectedOperator}`
        : "";

    calculatePreview();

}


/* ========================================
   7. HANDLE NUMBER INPUT
======================================== */

function appendNumber(number) {

    if (currentValue === "Error") {
        clearCalculator();
    }

    if (shouldResetDisplay) {

        currentValue = number === "." ? "0." : number;

        shouldResetDisplay = false;

    } else {

        if (number === "." && currentValue.includes(".")) {
            return;
        }

        if (currentValue.replace(".", "").length >= 15) {
            return;
        }

        if (number === "." && currentValue === "0") {

            currentValue = "0.";

        } else if (currentValue === "0" && number !== ".") {

            currentValue = number;

        } else {

            currentValue += number;

        }

    }

    updateDisplay();

}


/* ========================================
   8. CHOOSE AN OPERATOR
======================================== */

function chooseOperator(operator) {

    if (currentValue === "Error") {
        return;
    }

    if (selectedOperator && !shouldResetDisplay) {

        calculate();

    }

    previousValue = currentValue;

    selectedOperator = operator;

    shouldResetDisplay = true;

    lastOperator = null;
    lastOperand = null;

    updateDisplay();

}


/* ========================================
   9. CALCULATE RESULT
======================================== */

function calculate() {

    if (currentValue === "Error") {
        return;
    }

    let result;

    // Handle repeated equals operations

    if (!selectedOperator) {

        if (lastOperator === null || lastOperand === null) {
            return;
        }

        result = performOperation(
            Number(currentValue),
            lastOperand,
            lastOperator
        );

    } else {

        // Ignore incomplete calculations

        if (shouldResetDisplay) {
            return;
        }

        const firstNumber = Number(previousValue);
        const secondNumber = Number(currentValue);

        result = performOperation(
            firstNumber,
            secondNumber,
            selectedOperator
        );

        lastOperator = selectedOperator;
        lastOperand = secondNumber;

    }

    // Handle invalid calculations

    if (result === null || !Number.isFinite(result)) {

        currentValue = "Error";

        previousValue = "";
        selectedOperator = null;

        shouldResetDisplay = true;

        lastOperator = null;
        lastOperand = null;

        updateDisplay();

        return;

    }

    // Save and display the result

    currentValue = formatNumber(result);

    previousValue = "";
    selectedOperator = null;

    shouldResetDisplay = true;

    updateDisplay();

}


/* ========================================
   10. CLEAR CALCULATOR
======================================== */

function clearCalculator() {

    currentValue = "0";

    previousValue = "";

    selectedOperator = null;

    shouldResetDisplay = false;

    lastOperator = null;
    lastOperand = null;

    updateDisplay();

}


/* ========================================
   11. DELETE LAST CHARACTER
======================================== */

function deleteNumber() {

    if (currentValue === "Error" || shouldResetDisplay) {

        currentValue = "0";

        shouldResetDisplay = false;

    } else {

        currentValue = currentValue.length > 1
            ? currentValue.slice(0, -1)
            : "0";

        if (currentValue === "-") {
            currentValue = "0";
        }

    }

    updateDisplay();

}


/* ========================================
   12. PERCENTAGE FUNCTION
======================================== */

function convertToPercentage() {

    if (currentValue === "Error") {
        return;
    }

    const number = Number(currentValue);

    currentValue = formatNumber(number / 100);

    shouldResetDisplay = false;

    updateDisplay();

}


/* ========================================
   13. TOGGLE NUMBER SIGN
======================================== */

function toggleSign() {

    if (currentValue === "0" || currentValue === "Error") {
        return;
    }

    currentValue = currentValue.startsWith("-")
        ? currentValue.slice(1)
        : `-${currentValue}`;

    updateDisplay();

}


/* ========================================
   14. BUTTON EVENT HANDLING
======================================== */

buttons.addEventListener("click", (event) => {

    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    // Number buttons

    if (button.dataset.number !== undefined) {

        appendNumber(button.dataset.number);

        return;

    }

    // Operator buttons

    if (button.dataset.operator) {

        chooseOperator(button.dataset.operator);

        return;

    }

    // Action buttons

    switch (button.dataset.action) {

        case "clear":
            clearCalculator();
            break;

        case "delete":
            deleteNumber();
            break;

        case "percent":
            convertToPercentage();
            break;

        case "sign":
            toggleSign();
            break;

        case "decimal":
            appendNumber(".");
            break;

        case "calculate":
            calculate();
            break;

    }

});


/* ========================================
   15. KEYBOARD SUPPORT
======================================== */

document.addEventListener("keydown", (event) => {

    const key = event.key;

    // Prevent keyboard shortcuts from interfering
    // when the user is typing inside another input.

    if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
    ) {
        return;
    }

    // Number and decimal input

    if (/^[0-9.]$/.test(key)) {

        appendNumber(key);

        return;

    }

    // Mathematical operators

    if (["+", "-", "*", "/"].includes(key)) {

        chooseOperator(key);

        return;

    }

    // Calculate result

    if (key === "Enter" || key === "=") {

        event.preventDefault();

        calculate();

        return;

    }

    // Delete last character

    if (key === "Backspace") {

        deleteNumber();

        return;

    }

    // Clear calculator

    if (key === "Escape") {

        clearCalculator();

        return;

    }

    // Percentage

    if (key === "%") {

        convertToPercentage();

    }

});
 

/* ========================================
   16. INITIALISE CALCULATOR
======================================== */

updateDisplay();
