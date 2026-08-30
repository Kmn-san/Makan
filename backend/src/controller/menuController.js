import * as menuService from "../service/menuService.js"


export const getMenu = async (req, res) => {
    try {
        const { restaurantId } = req.query;

        if (!restaurantId) {
            return res.status(400).json({ success: false, code: "INVALID_RESTAURANT_ID" })
        }

        const categories = await menuService.getCategories(restaurantId);
        const items = await menuService.getItems(restaurantId)

        if (items.length === 0) {
            return res.status(200).json({ success: true, data: categories })
        }

        const itemIds = items.map(item => item.id);
        const options = await menuService.getOptions(itemIds);

        let values = [];
        if (options.length > 0) {
            const optionIds = options.map(opt => opt.id);
            values = await menuService.getValues(optionIds)
        }
        // A. 把选项值按 option_id 分组
        const valuesByOption = {};
        values.forEach(v => {
            if (!valuesByOption[v.option_id]) valuesByOption[v.option_id] = [];
            valuesByOption[v.option_id].push(v);
        });

        // B. 把选项值塞进选项组，并把选项组按 menu_item_id 分组
        const optionsByItem = {};
        options.forEach(o => {
            o.values = valuesByOption[o.id] || []; // 挂载值
            if (!optionsByItem[o.menu_item_id]) optionsByItem[o.menu_item_id] = [];
            optionsByItem[o.menu_item_id].push(o);
        });

        // C. 把选项组塞进菜品，并把菜品按 category_id 分组
        const itemsByCategory = {};
        items.forEach(i => {
            i.options = optionsByItem[i.id] || []; // 挂载选项
            if (!itemsByCategory[i.category_id]) itemsByCategory[i.category_id] = [];
            itemsByCategory[i.category_id].push(i);
        });

        // D. 把菜品塞进分类，生成最终结果
        const finalMenu = categories.map(c => {
            c.items = itemsByCategory[c.id] || []; // 挂载菜品
            return c;
        });

        return res.status(200).json({
            success: true,
            data: finalMenu
        });

    } catch (error) {
        console.error('getMenu controller error:', error);
        return res.status(500).json({
            success: false,
            code: 'INTERNAL_SERVER_ERROR'
        });
    }
}