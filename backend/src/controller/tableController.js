import * as tableService from "../service/tableService.js";

export const resolveTable = async (req, res) => {
    try {
        const { restaurantId, tableCode } = req.query;

        if (!restaurantId || !tableCode) {
            return res.status(400).json({
                success: false,
                code: 'MISSING_PARAMS',
                message: 'restaurantId and tableCode are required.'
            });
        }

        const table = await tableService.resolveTable(restaurantId, tableCode);

        if (!table) {
            return res.status(404).json({
                success: false,
                code: 'TABLE_NOT_FOUND',
                message: 'Table not found or inactive.'
            });
        }

        return res.status(200).json({ success: true, data: table });
    } catch (error) {
        console.error('Resolve Table Error:', error);
        return res.status(500).json({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to resolve table'
        });
    }
};