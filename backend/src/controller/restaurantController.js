import * as restaurantService from "../service/restaurantService.js";

export const getRestaurants = async (req, res) => {
    try {
        const restaurants = await restaurantService.getActiveRestaurants();
        return res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants
        });
    } catch (error) {
        console.error('Get Restaurants Error:', error);
        return res.status(500).json({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch restaurants'
        });
    }
};