'use strict';

const FoodAppearanceConfig = {
    APPLE: 'apple',
    BURGER: 'burger',
    MILKSHAKE: 'milkshake',
    DONUT: 'donut',
    SUSHI: 'sushi',
    TACOS: 'tacos',
};

const FOOD_APPEARANCE_IDS = Object.values(FoodAppearanceConfig);

module.exports = {
    FoodAppearanceConfig,
    FOOD_APPEARANCE_IDS,
};
