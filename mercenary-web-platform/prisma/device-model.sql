-- Device model for mobile integration
-- Add this to your Prisma schema

model Device {
  id                  String          @id @default(cuid())
  userId              String
  deviceId            String
  platform            DevicePlatform
  version             String
  pushToken           String?
  webPushSubscription String?         // JSON string for web push subscription
  lastActive          DateTime        @default(now())
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, deviceId])
  @@map("devices")
}
