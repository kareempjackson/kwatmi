-- CreateTable
CREATE TABLE "sms_logs" (
    "id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message_id" TEXT,
    "error_message" TEXT,
    "ride_id" TEXT,
    "cost_ngn" INTEGER NOT NULL DEFAULT 0,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sms_logs_phone_number_idx" ON "sms_logs"("phone_number");

-- CreateIndex
CREATE INDEX "sms_logs_ride_id_idx" ON "sms_logs"("ride_id");

-- CreateIndex
CREATE INDEX "sms_logs_status_idx" ON "sms_logs"("status");

-- CreateIndex
CREATE INDEX "sms_logs_sent_at_idx" ON "sms_logs"("sent_at");

-- CreateIndex
CREATE INDEX "sms_logs_template_idx" ON "sms_logs"("template");

-- AddForeignKey
ALTER TABLE "sms_logs" ADD CONSTRAINT "sms_logs_ride_id_fkey" FOREIGN KEY ("ride_id") REFERENCES "rides"("id") ON DELETE SET NULL ON UPDATE CASCADE;
