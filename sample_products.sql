-- Insert sample products for testing
-- Run this after importing database.sql

INSERT INTO `products` (`category_id`, `name`, `description`, `price`, `image`) VALUES
-- Nam (category_id = 1)
(1, 'Áo Thun Nam Cotton Trắng', 'Áo thun nam chất liệu cotton cao cấp, thoáng mát, thiết kế tối giản phù hợp mọi phong cách.', 199000, 'uploads/product_shirt_1_1764858043053.png'),
(1, 'Quần Jean Nam Xanh', 'Quần jean nam dáng regular fit, chất liệu denim cao cấp, bền đẹp theo thời gian.', 450000, 'uploads/product_jeans_1764858111570.png'),
(1, 'Áo Blazer Nam Đen', 'Áo blazer nam công sở, thiết kế hiện đại, chất liệu vải cao cấp, form dáng chuẩn.', 890000, 'uploads/product_blazer_1764858155434.png'),

-- Nữ (category_id = 2)
(2, 'Váy Nữ Xanh Navy', 'Váy nữ thanh lịch, thiết kế dáng A, chất liệu vải mềm mại, phù hợp đi làm và dự tiệc.', 550000, 'uploads/product_dress_1_1764858065740.png'),

-- Bé trai (category_id = 3)
(3, 'Áo Thun Bé Trai Họa Tiết', 'Áo thun bé trai với họa tiết vui nhộn, chất liệu cotton an toàn cho trẻ.', 150000, 'uploads/product_kids_shirt_1764858084685.png'),
(3, 'Quần Short Bé Trai', 'Quần short cho bé trai năng động, chất liệu thấm hút mồ hôi tốt.', 180000, 'uploads/product_boy_shorts_1764858174698.png'),

-- Bé gái (category_id = 4)
(4, 'Váy Bé Gái Hồng Hoa', 'Váy bé gái xinh xắn với họa tiết hoa, chất liệu mềm mại, thoải mái.', 250000, 'uploads/product_girl_dress_1764858135718.png');
