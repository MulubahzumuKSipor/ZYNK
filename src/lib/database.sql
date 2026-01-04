-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- DROP TABLES IF THEY EXIST (safe rerun)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS coupon_usages CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS variant_images CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS stock_reservations CASCADE;
DROP TABLE IF EXISTS variant_attributes CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS attribute_values CASCADE;
DROP TABLE IF EXISTS attributes CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;

------------------------------
-- USERS & AUTH
------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    label TEXT,
    country TEXT,
    city TEXT,
    street TEXT,
    postal_code TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    expires_at TIMESTAMPTZ
);

------------------------------
-- CATEGORIES & BRANDS
------------------------------
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    parent_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT TRUE
);
CREATE INDEX idx_categories_slug ON categories(slug);

CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE
);
CREATE INDEX idx_brands_slug ON brands(slug);

------------------------------
-- PRODUCTS & ATTRIBUTES
------------------------------
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    brand_id UUID REFERENCES brands(id),
    category_id UUID REFERENCES categories(id),
    currency TEXT DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_slug ON products(slug);

CREATE TABLE attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    data_type TEXT NOT NULL -- text | number | boolean
);

CREATE TABLE attribute_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attribute_id UUID REFERENCES attributes(id) ON DELETE CASCADE,
    value TEXT NOT NULL
);

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    compare_at_price NUMERIC(12,2),
    stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE variant_attributes (
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    attribute_value_id UUID REFERENCES attribute_values(id) ON DELETE CASCADE,
    PRIMARY KEY (variant_id, attribute_value_id)
);

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE
);

CREATE TABLE variant_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    url TEXT NOT NULL
);

------------------------------
-- CART SYSTEM
------------------------------
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id),
    quantity INT CHECK (quantity > 0) DEFAULT 1
);

------------------------------
-- ORDER SYSTEM
------------------------------
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    subtotal NUMERIC(12,2),
    tax NUMERIC(12,2),
    shipping_fee NUMERIC(12,2),
    total NUMERIC(12,2),
    currency TEXT DEFAULT 'USD',
    shipping_address_snapshot JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_orders_user_id ON orders(user_id);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id),
    product_name_snapshot TEXT,
    variant_snapshot TEXT,
    price_snapshot NUMERIC(12,2),
    quantity INT CHECK (quantity > 0)
);

------------------------------
-- STOCK RESERVATIONS
------------------------------
CREATE TABLE stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INT CHECK (quantity > 0),
    reserved_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    order_id UUID REFERENCES orders(id)
);
CREATE INDEX idx_reservations_variant ON stock_reservations(variant_id);
CREATE INDEX idx_reservations_expires ON stock_reservations(expires_at);

------------------------------
-- PAYMENTS
------------------------------
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    provider TEXT,
    status TEXT DEFAULT 'pending',
    amount NUMERIC(12,2),
    transaction_ref TEXT,
    paid_at TIMESTAMPTZ
);

------------------------------
-- REVIEWS
------------------------------
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

------------------------------
-- COUPONS, WAREHOUSE, INVENTORY
------------------------------
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE,
    discount_type TEXT,
    discount_value NUMERIC(12,2),
    min_order_amount NUMERIC(12,2),
    expires_at TIMESTAMPTZ
);

CREATE TABLE coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons(id),
    user_id UUID REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    location TEXT
);

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID REFERENCES product_variants(id),
    warehouse_id UUID REFERENCES warehouses(id),
    quantity_change INT,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_inventory_variant ON inventory_movements(variant_id);

------------------------------
-- ACTIVITY LOGS
------------------------------
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action TEXT,
    entity TEXT,
    entity_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

------------------------------
-- TRIGGER: INVENTORY SYNCHRONIZATION
------------------------------
CREATE OR REPLACE FUNCTION update_variant_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE product_variants
    SET stock_quantity = stock_quantity + NEW.quantity_change
    WHERE id = NEW.variant_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_inventory_update
AFTER INSERT ON inventory_movements
FOR EACH ROW
EXECUTE FUNCTION update_variant_stock();

------------------------------
-- RESERVE STOCK FUNCTION (FIXED)
------------------------------
CREATE OR REPLACE FUNCTION reserve_stock(
    p_user_id UUID,
    p_cart_id UUID,
    p_reservation_minutes INT DEFAULT 15
)
RETURNS VOID AS $$
DECLARE
    ci RECORD;
    v_available_stock INT;
    v_expires TIMESTAMPTZ := NOW() + (p_reservation_minutes || ' minutes')::interval;
BEGIN
    FOR ci IN
        SELECT variant_id, quantity
        FROM cart_items
        WHERE cart_id = p_cart_id
    LOOP
        -- 1. LOCK THE ROW IMMEDIATELY
        -- This forces other checkouts for this SKU to wait, preventing race conditions.
        PERFORM 1 FROM product_variants WHERE id = ci.variant_id FOR UPDATE;

        -- 2. NOW CALCULATE STOCK
        -- Since the row is locked, this sum is guaranteed to be accurate.
        SELECT (pv.stock_quantity - COALESCE(SUM(sr.quantity), 0))
        INTO v_available_stock
        FROM product_variants pv
        LEFT JOIN stock_reservations sr
            ON sr.variant_id = pv.id AND sr.expires_at > NOW()
        WHERE pv.id = ci.variant_id
        GROUP BY pv.stock_quantity;

        -- 3. VALIDATE
        IF v_available_stock < ci.quantity THEN
            RAISE EXCEPTION 'Item % is no longer available. Only % left.', ci.variant_id, v_available_stock;
        END IF;

        -- 4. INSERT RESERVATION
        INSERT INTO stock_reservations(user_id, variant_id, quantity, reserved_at, expires_at)
        VALUES (p_user_id, ci.variant_id, ci.quantity, NOW(), v_expires);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

------------------------------
-- START CHECKOUT SESSION FUNCTION
------------------------------
CREATE OR REPLACE FUNCTION start_checkout_session(
    p_user_id UUID,
    p_cart_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
BEGIN
    INSERT INTO orders (user_id, status, subtotal, total)
    SELECT user_id, 'pending_payment', 0, 0
    FROM carts
    WHERE id = p_cart_id
    RETURNING id INTO v_order_id;

    PERFORM reserve_stock(p_user_id, p_cart_id);

    INSERT INTO order_items(order_id, variant_id, product_name_snapshot, price_snapshot, quantity)
    SELECT v_order_id, ci.variant_id, p.name, pv.price, ci.quantity
    FROM cart_items ci
    JOIN product_variants pv ON pv.id = ci.variant_id
    JOIN products p ON p.id = pv.product_id
    WHERE ci.cart_id = p_cart_id;

    DELETE FROM cart_items WHERE cart_id = p_cart_id;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;

------------------------------
-- CONFIRM PAYMENT FUNCTION
------------------------------
CREATE OR REPLACE FUNCTION confirm_payment(
    p_order_id UUID,
    p_payment_amount NUMERIC,
    p_payment_provider TEXT,
    p_transaction_ref TEXT
)
RETURNS VOID AS $$
DECLARE
    ci RECORD;
    v_user_id UUID;
BEGIN
    SELECT user_id INTO v_user_id
    FROM orders
    WHERE id = p_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order % not found', p_order_id;
    END IF;

    FOR ci IN
        SELECT sr.variant_id, sr.quantity
        FROM stock_reservations sr
        JOIN order_items oi ON oi.order_id = p_order_id AND oi.variant_id = sr.variant_id
        WHERE sr.user_id = v_user_id AND sr.expires_at > NOW()
    LOOP
        UPDATE product_variants
        SET stock_quantity = stock_quantity - ci.quantity
        WHERE id = ci.variant_id AND stock_quantity >= ci.quantity;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Insufficient stock for variant % at payment time', ci.variant_id;
        END IF;
    END LOOP;

    UPDATE orders
    SET status = 'paid',
        total = p_payment_amount
    WHERE id = p_order_id;

    INSERT INTO payments(order_id, provider, status, amount, transaction_ref, paid_at)
    VALUES (p_order_id, p_payment_provider, 'success', p_payment_amount, p_transaction_ref, NOW());

    DELETE FROM stock_reservations
    WHERE user_id = v_user_id
      AND variant_id IN (
          SELECT variant_id
          FROM order_items
          WHERE order_id = p_order_id
      );

END;
$$ LANGUAGE plpgsql;
