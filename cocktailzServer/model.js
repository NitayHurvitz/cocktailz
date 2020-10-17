const fs = require('fs')

async function getMatchingCocktails(availableIngredients) {
    const cocktailsFile = await fs.promises.readFile("../data/cocktails.json")
    const cocktailsList = JSON.parse(cocktailsFile)

    return cocktailsList.filter(cocktail => cocktail.ingredients.some(ingredient => availableIngredients.includes(ingredient)))
}

async function getMatchingIngredients(ingredientPrefix) {
    const cocktailsFile = await fs.promises.readFile("../data/cocktails.json")
    const cocktailsList = JSON.parse(cocktailsFile)

    const ingredientSet = new Set
    cocktailsList.forEach(cocktail => {
        cocktail.ingredients.forEach(ingred => {
            if (ingred.toLowerCase().startsWith(ingredientPrefix.toLowerCase())) {
                ingredientSet.add(ingred)
            }
        })
    })

    return Array.from(ingredientSet)
}

module.exports = {
    getMatchingCocktails,
    getMatchingIngredients
}
