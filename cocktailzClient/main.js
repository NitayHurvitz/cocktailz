const COCKTAILS_ROUTING = "/get-cocktails"
const AUTOCOMPLETE_ROUTING = "/get-ingredients/"

const cocktailsGrid = document.getElementById("cocktails-grid")
const ingredientsInput = document.getElementById("ingredients-input")
const selectedIngredientsContainer = document.getElementById("selected-ingredients-container")
const autocompleteContainer = document.getElementById("autocomplete-container")

const INGRED_TAG_CLASS = "selected-ingredient-tag"
const DELETE_INGRED_TAG_BUTTON_CLASS = "delete-ingred-tag-button"
const AUTOCOMPLETE_ITEM_CLASS = "autocomplete-item"
const SELECTED_AUTOCOMPLETE_ITEM_CLASS = "selected-autocomplete-item"

const KEY_CODES = {
    "ARROW_UP": 38,
    "ARROW_DOWN": 40,
    "ENTER": 13,
    "SHIFT": 16
}

let cocktails = undefined

// ------ Server requests ------ 
function getCocktailzFromServer() {
    const currentIngredList = getCurrentIngredList()

    return fetch(COCKTAILS_ROUTING, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentIngredList)
    })
        .then(response => response.json())
        .then(data => cocktails = data)
}

function getIngredientAutocompleteFromServer(prefix) {
    return fetch(AUTOCOMPLETE_ROUTING + prefix, {
        method: "GET"
    })
        .then(response => response.json())
}

// ------ DOM Elements Adding ------ 

function addSelectedIngredTag(name) {
    const tagElement = document.createElement("div")
    tagElement.classList.add(INGRED_TAG_CLASS)
    tagElement.innerText = name
    tagElement.ingredName = name

    const deleteButton = document.createElement("div")
    deleteButton.innerText = "X"
    deleteButton.classList.add(DELETE_INGRED_TAG_BUTTON_CLASS)
    deleteButton.addEventListener("click", (event) => {
        const tagElement = event.target.parentElement
        selectedIngredientsContainer.removeChild(tagElement)
    })

    tagElement.appendChild(deleteButton)
    selectedIngredientsContainer.appendChild(tagElement)
}

function addAutocompleteElement(text) {
    const newElement = document.createElement("div")
    newElement.classList.add(AUTOCOMPLETE_ITEM_CLASS)
    newElement.innerText = text

    newElement.addEventListener("click", onAutocompleteMouseClick)
    autocompleteContainer.appendChild(newElement)
}

// ------ DOM Query ------
function getCurrentIngredList() {
    return Array.from(selectedIngredientsContainer.getElementsByClassName(INGRED_TAG_CLASS)).map(element => element.ingredName)
}

function getAutocompleteItems() {
    return Array.from(autocompleteContainer.getElementsByClassName(AUTOCOMPLETE_ITEM_CLASS))
}

function getSelectedAutocompleteItem() {
    const selectedAutocompleteItems = getAutocompleteItems().filter(element => element.classList.contains(SELECTED_AUTOCOMPLETE_ITEM_CLASS))
    return selectedAutocompleteItems.length > 0 ?
        selectedAutocompleteItems[0]
        : undefined
}

// ------ DOM Edit ------
function emptyAutocomplete() {
    getAutocompleteItems().forEach(element => element.remove())
}

function setAutocompleteElements(serverIngredList) {
    emptyAutocomplete()
    serverIngredList.slice(0, 5).forEach(ingred =>
        addAutocompleteElement(ingred)
    )
}

// ------ Event Handlers
function onAutocompleteMouseClick(event) {
    if (event.target.classList.contains(AUTOCOMPLETE_ITEM_CLASS)) {
        addSelectedIngredTag(event.target.innerText)
        ingredientsInput.value = ""
        emptyAutocomplete()
    }
}

function onInputEnterClick() {
    const autocompleteItems = getAutocompleteItems()
    const selectedAutocompleteItem = getSelectedAutocompleteItem()

    if (autocompleteItems.length > 0) {
        const newIngred = selectedAutocompleteItem?.innerText ?? autocompleteItems[0].innerText
        const currentIngredList = getCurrentIngredList()

        if (newIngred != "" && !currentIngredList.includes(newIngred)) {
            addSelectedIngredTag(newIngred)
            ingredientsInput.value = ""
            emptyAutocomplete()
        }
    }
}

function onInputArrowDownOrUp(keyCode) {
    const autocompleteItems = getAutocompleteItems()
    const selectedAutocompleteItem = getSelectedAutocompleteItem()

    if (autocompleteItems.length > 0) {
        if (selectedAutocompleteItem) {
            selectedAutocompleteItem.classList.remove(SELECTED_AUTOCOMPLETE_ITEM_CLASS)

            const nextItem = keyCode == KEY_CODES.ARROW_DOWN ?
                selectedAutocompleteItem.nextSibling
                : keyCode == KEY_CODES.ARROW_UP ?
                    selectedAutocompleteItem.previousSibling
                    : undefined

            if (nextItem) {
                nextItem.classList.add(SELECTED_AUTOCOMPLETE_ITEM_CLASS)
            }
            else {
                autocompleteItems[0].classList.add(SELECTED_AUTOCOMPLETE_ITEM_CLASS)
            }
        }
        else {
            autocompleteItems[0].classList.add(SELECTED_AUTOCOMPLETE_ITEM_CLASS)
        }
    }
}

function onInputDefaultKeyUp() {
    const inputValue = ingredientsInput.value
    if (inputValue != "") {
        getIngredientAutocompleteFromServer(inputValue).then(setAutocompleteElements)
    }
    else {
        emptyAutocomplete()
    }
}

function onIngredInputKeyUp(event) {
    switch (event.keyCode) {

        case KEY_CODES.ENTER:
            onInputEnterClick()
            break

        case KEY_CODES.ARROW_DOWN:
        case KEY_CODES.ARROW_UP:
            onInputArrowDownOrUp(event.keyCode)
            break

        case KEY_CODES.SHIFT:
            break

        default:
            onInputDefaultKeyUp()
    }

}


ingredientsInput.addEventListener("keyup", onIngredInputKeyUp)
const selectedIngredientsObserver = new MutationObserver((mutations) => getCocktailzFromServer())
selectedIngredientsObserver.observe(selectedIngredientsContainer, { childList: true })