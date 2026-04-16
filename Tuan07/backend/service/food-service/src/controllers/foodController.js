const Food = require('../models/Food');

// [GET] /foods - Lấy danh sách tất cả món ăn
exports.getAllFoods = async (req, res) => {
    try {
        const foods = await Food.findAll();
        res.status(200).json(foods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /foods - Tạo món ăn mới
exports.createFood = async (req, res) => {
    try {
        const newFood = await Food.create(req.body);
        res.status(201).json(newFood);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// [PUT] /foods/{id} - Cập nhật món ăn theo ID
exports.updateFood = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Food.update(req.body, { where: { id } });
        
        if (updated) {
            const updatedFood = await Food.findByPk(id);
            return res.status(200).json(updatedFood);
        }
        return res.status(404).json({ message: 'Food not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [DELETE] /foods/{id} - Xóa món ăn theo ID
exports.deleteFood = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Food.destroy({ where: { id } });
        
        if (deleted) {
            return res.status(200).json({ message: 'Food deleted successfully' });
        }
        return res.status(404).json({ message: 'Food not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// [GET] /foods/:id - Lấy món ăn theo ID
exports.getFoodById = async (req, res) => {
    try {
        const { id } = req.params;
        const food = await Food.findByPk(id);
        if (food) {
            return res.status(200).json(food);
        }
        return res.status(404).json({ message: 'Food not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};