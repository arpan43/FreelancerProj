-- Add payment_link column to invoices table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' 
        AND column_name = 'payment_link'
    ) THEN
        ALTER TABLE invoices ADD COLUMN payment_link TEXT;
    END IF;
END $$;

-- Add paid_at column to invoices table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' 
        AND column_name = 'paid_at'
    ) THEN
        ALTER TABLE invoices ADD COLUMN paid_at TIMESTAMPTZ;
    END IF;
END $$;

-- Add notes column to payments table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE payments ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Add processed_at column to payments table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' 
        AND column_name = 'processed_at'
    ) THEN
        ALTER TABLE payments ADD COLUMN processed_at TIMESTAMPTZ;
    END IF;
END $$;

-- Update the payments table to ensure all required columns exist
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index on payment_link for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_payment_link ON invoices(payment_link) WHERE payment_link IS NOT NULL;

-- Create index on invoice_id for payments
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);

-- Create index on user_id for payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to invoices table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_invoices_updated_at'
    ) THEN
        CREATE TRIGGER update_invoices_updated_at 
            BEFORE UPDATE ON invoices 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Apply trigger to payments table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_payments_updated_at'
    ) THEN
        CREATE TRIGGER update_payments_updated_at 
            BEFORE UPDATE ON payments 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Add comments to document the columns
COMMENT ON COLUMN invoices.payment_link IS 'URL for client to make payment online';
COMMENT ON COLUMN invoices.paid_at IS 'Timestamp when invoice was fully paid';
COMMENT ON COLUMN payments.notes IS 'Additional notes about the payment';
COMMENT ON COLUMN payments.processed_at IS 'Timestamp when payment was processed';
