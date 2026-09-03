import * as menuService from "../service/menuService.js"


export const getMenu = async (req, res) => {
    try {
        const { restaurantId } = req.query;

        if (!restaurantId) {
            return res.status(400).json({ success: false, code: "INVALID_RESTAURANT_ID" })
        }

        // get the categories and item
        const categories = await menuService.getCategories(restaurantId);
        const items = await menuService.getItems(restaurantId)

        // if all items are empty just retun the categories
        if (items.length === 0) {
            return res.status(200).json({ success: true, data: categories })
        }

        // get items id and option(suger, ice level)
        const itemIds = items.map(item => item.id);
        const options = await menuService.getOptions(itemIds);


        // get values for option
        let values = [];
        if (options.length > 0) {
            const optionIds = options.map(opt => opt.id);
            values = await menuService.getValues(optionIds)
        }
        // arrange group for values using option id
        const valuesByOption = {};
        values.forEach(v => {
            // if didnt exist then create a new group
            if (!valuesByOption[v.option_id]) valuesByOption[v.option_id] = [];
            // else push inside the exist group
            valuesByOption[v.option_id].push(v);
        });

        // insert values into options and group with menu_item_id
        const optionsByItem = {};
        options.forEach(o => {
            // if there are values then give the values else show [] to represent no values for this option
            o.values = valuesByOption[o.id] || [];
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