# Supabase Database Schema — Tourist Corner

Generated: 2026-05-11

---

## Tables

### 1. `users` — User profiles linked to auth.users

| Column       | Type        | Constraints                                |
|-------------|-------------|--------------------------------------------|
| id          | uuid        | PK, references auth.users(id) on delete cascade |
| email       | text        | NOT NULL, UNIQUE                           |
| name        | text        | NOT NULL                                   |
| avatar_url  | text        |                                            |
| role        | text        | NOT NULL, CHECK IN ('client', 'owner', 'admin'), DEFAULT 'client' |
| phone       | text        |                                            |
| created_at  | timestamptz | NOT NULL, DEFAULT now()                    |

**Indexes:** `idx_users_email` (unique), `idx_users_role`

**RLS Policies:**
- `users_select_all` — Anyone can read
- `users_insert_own` — Users can insert own profile (or null for trigger)
- `users_update_own` — Users can update own profile
- `Users can update own profile` — FOR UPDATE with auth check

**Trigger:** `on_auth_user_created` — Auto-creates profile on auth signup via `handle_new_user()`

---

### 2. `hotels` — Hotel properties

| Column        | Type        | Constraints                                  |
|--------------|-------------|----------------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid()                |
| name         | text        | NOT NULL                                     |
| type         | text        | NOT NULL, CHECK IN ('hotel', 'resort', 'motel', 'residential') |
| description  | text        |                                              |
| address      | text        |                                              |
| city         | text        |                                              |
| phone        | text        |                                              |
| email        | text        |                                              |
| images       | text[]      | DEFAULT '{}'                                 |
| cover_image  | text        |                                              |
| rating       | decimal(2,1)| DEFAULT 0                                    |
| review_count | int         | DEFAULT 0                                    |
| amenities    | text[]      | DEFAULT '{}'                                 |
| latitude     | decimal(10,8)|                                             |
| longitude    | decimal(11,8)|                                             |
| price_range_min | int      |                                              |
| price_range_max | int      |                                              |
| manager_id   | uuid        | REFERENCES users(id) on delete set null      |
| branch_of    | uuid        | REFERENCES hotels(id) (self-ref for branches)|
| is_main      | boolean     | NOT NULL, DEFAULT false                      |
| created_at   | timestamptz | NOT NULL, DEFAULT now()                      |
| updated_at   | timestamptz | NOT NULL, DEFAULT now()                      |
| is_active    | boolean     | DEFAULT true                                 |

**Indexes:** `idx_hotels_city`, `idx_hotels_type`, `idx_hotels_manager`, `idx_hotels_active`

**RLS Policies:**
- `hotels_select_active` — Public sees active hotels
- `hotels_select_manager` — Manager sees their hotels (uses `get_hotel_manager_id` bypass function)
- `hotels_insert_manager`, `hotels_update_manager`, `hotels_delete_manager` — Manager CRUD
- `hotels_select_admin`, `hotels_update_admin`, `hotels_delete_admin` — Admin bypass

**Trigger:** `update_hotels_updated_at` — Auto-updates `updated_at`

**Trigger:** `trg_check_branch_deletion` — Prevents deleting main hotels with branches

---

### 3. `rooms` — Hotel rooms

| Column              | Type        | Constraints                                  |
|--------------------|-------------|----------------------------------------------|
| id                 | uuid        | PK, DEFAULT gen_random_uuid()                |
| hotel_id           | uuid        | NOT NULL, REFERENCES hotels(id) on delete cascade |
| name               | text        | NOT NULL                                     |
| description        | text        |                                              |
| type               | text        |                                              |
| price_per_night    | decimal(10,2)| NOT NULL                                    |
| capacity           | int         | NOT NULL                                     |
| bed_type           | text        |                                              |
| size               | int         |                                              |
| images             | text[]      | DEFAULT '{}'                                 |
| amenities          | text[]      | DEFAULT '{}'                                 |
| status             | text        | CHECK IN ('available', 'occupied', 'maintenance'), DEFAULT 'available' |
| is_available       | boolean     | DEFAULT true                                 |
| custom_room_type_id| uuid        | REFERENCES custom_room_types(id) on delete set null |
| created_at         | timestamptz | NOT NULL, DEFAULT now()                      |
| updated_at         | timestamptz | NOT NULL, DEFAULT now()                      |

**Indexes:** `idx_rooms_hotel`

**RLS Policies:**
- `rooms_select_all` — Public can read
- `rooms_insert_manager`, `rooms_update_manager`, `rooms_delete_manager` — Manager via hotel ownership

**Trigger:** `update_rooms_updated_at`

---

### 4. `room_availability` — Daily room availability tracking

| Column         | Type        | Constraints                       |
|---------------|-------------|-----------------------------------|
| room_id       | uuid        | PK, REFERENCES rooms(id) on delete cascade |
| date          | date        | PK                                |
| is_available  | boolean     | NOT NULL, DEFAULT true            |
| price_override| decimal(10,2)|                                  |

**RLS:** `room_availability_select_all` (public), `room_availability_manage_manager` (manager)

---

### 5. `reservations` — Booking records

| Column              | Type        | Constraints                                  |
|--------------------|-------------|----------------------------------------------|
| id                 | uuid        | PK, DEFAULT gen_random_uuid()                |
| room_id            | uuid        | NOT NULL, REFERENCES rooms(id) on delete cascade |
| user_id            | uuid        | REFERENCES users(id) on delete set null      |
| guest_name         | text        | NOT NULL                                     |
| guest_email        | text        | NOT NULL                                     |
| check_in           | date        | NOT NULL                                     |
| check_out          | date        | NOT NULL                                     |
| status             | text        | NOT NULL, DEFAULT 'pending', CHECK IN ('pending', 'accepted', 'checked-in', 'checked-out', 'completed', 'cancelled', 'no-show') |
| total_price        | numeric     | NOT NULL, DEFAULT 0                          |
| guest_phone        | text        |                                              |
| notes              | text        |                                              |
| actual_check_in    | timestamptz |                                              |
| actual_check_out   | timestamptz |                                              |
| cancellation_reason| text        |                                              |
| cancellation_fee   | numeric     | DEFAULT 0                                    |
| refund_amount      | numeric     | DEFAULT 0                                    |
| cancelled_at       | timestamptz |                                              |
| no_show_flag       | boolean     | DEFAULT false                                |
| created_at         | timestamptz | NOT NULL, DEFAULT now()                      |
| updated_at         | timestamptz | NOT NULL, DEFAULT now()                      |

**Indexes:** `idx_reservations_user_id`, `idx_reservations_status`, `idx_reservations_room_status`, `idx_reservations_check_in`

**RLS Policies:**
- `Managers can view reservations` — Via hotel ownership
- `Managers can update reservations` — Via hotel ownership
- `Owners can view/update reservations for their hotels` — Via manager_id
- `Clients can view/insert own reservations` — Via user_id
- `Admin can manage all reservations` — Role check

**Trigger:** `trg_reservation_status_change` — Auto-records status changes to `reservation_status_history`

---

### 6. `reservation_status_history` — Status change audit log

| Column         | Type        | Constraints                             |
|---------------|-------------|-----------------------------------------|
| id            | uuid        | PK, DEFAULT gen_random_uuid()           |
| reservation_id| uuid        | NOT NULL, REFERENCES reservations(id) on delete cascade |
| from_status   | text        |                                         |
| to_status     | text        | NOT NULL                                |
| changed_by    | uuid        | REFERENCES users(id)                    |
| changed_at    | timestamptz | NOT NULL, DEFAULT now()                 |
| reason        | text        |                                         |

**Indexes:** `idx_reservation_status_history_reservation_id`

**RLS:** Managers view via hotel, clients view own, admin full access

---

### 7. `comments` — User reviews/comments

| Column      | Type        | Constraints                                  |
|------------|-------------|----------------------------------------------|
| id         | uuid        | PK, DEFAULT gen_random_uuid()                |
| target_id  | uuid        | NOT NULL                                     |
| target_type| text        | NOT NULL, CHECK IN ('hotel', 'room')         |
| user_id    | uuid        | REFERENCES users(id) on delete set null      |
| user_name  | text        | NOT NULL                                     |
| user_avatar| text        |                                              |
| rating     | int         | CHECK 1-5                                    |
| content    | text        | NOT NULL                                     |
| images     | text[]      | DEFAULT '{}'                                 |
| likes      | int         | DEFAULT 0                                    |
| created_at | timestamptz | NOT NULL, DEFAULT now()                      |
| updated_at | timestamptz | NOT NULL, DEFAULT now()                      |

**Indexes:** `idx_comments_target`, `idx_comments_user`

**RLS:** Public read, users manage own

---

### 8. `custom_room_types` — Owner-defined room types

| Column      | Type        | Constraints                             |
|------------|-------------|-----------------------------------------|
| id         | uuid        | PK, DEFAULT gen_random_uuid()           |
| owner_id   | uuid        | NOT NULL, REFERENCES users(id)          |
| name       | text        | NOT NULL                                |
| description| text        |                                         |
| icon       | text        |                                         |
| capacity   | int         | NOT NULL, DEFAULT 2                     |
| base_price | numeric(10,2)| NOT NULL                               |
| created_at | timestamptz | NOT NULL, DEFAULT now()                 |

**RLS:** Owner manages own, public can view

---

### 9. `custom_services` — Owner-defined hotel services

| Column      | Type        | Constraints                             |
|------------|-------------|-----------------------------------------|
| id         | uuid        | PK, DEFAULT gen_random_uuid()           |
| owner_id   | uuid        | NOT NULL, REFERENCES users(id)          |
| hotel_id   | uuid        | REFERENCES hotels(id)                   |
| name       | text        | NOT NULL                                |
| description| text        |                                         |
| icon       | text        |                                         |
| price      | numeric(10,2)|                                        |
| available  | boolean     | NOT NULL, DEFAULT true                  |
| created_at | timestamptz | NOT NULL, DEFAULT now()                 |

**RLS:** Owner manages own, public can view

---

### 10. `room_custom_services` — Junction: rooms ↔ custom services

| Column            | Type  | Constraints                              |
|------------------|-------|------------------------------------------|
| room_id          | uuid  | PK, REFERENCES rooms(id) on delete cascade |
| custom_service_id| uuid  | PK, REFERENCES custom_services(id) on delete cascade |

**RLS:** Manager via hotel ownership

---

### 11. `registration_codes` — Owner onboarding codes

| Column    | Type        | Constraints                             |
|----------|-------------|-----------------------------------------|
| id       | uuid        | PK, DEFAULT gen_random_uuid()           |
| code     | text        | UNIQUE, NOT NULL                        |
| used     | boolean     | NOT NULL, DEFAULT false                 |
| created_by| uuid       | REFERENCES users(id)                    |
| created_at| timestamptz| NOT NULL, DEFAULT now()                 |
| used_at  | timestamptz |                                         |
| used_by  | uuid        | REFERENCES users(id)                    |

**RLS:** Admin manages, owners can view used codes

---

### 12. `featured_hotels` — Admin-curated featured hotels

| Column        | Type        | Constraints                             |
|--------------|-------------|-----------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid()           |
| hotel_id     | uuid        | UNIQUE, REFERENCES hotels(id) on delete cascade |
| featured_at  | timestamptz | NOT NULL, DEFAULT now()                 |
| expires_at   | timestamptz |                                         |
| active       | boolean     | NOT NULL, DEFAULT true                  |
| featured_order| int        | NOT NULL, DEFAULT 0                     |
| created_at   | timestamptz | NOT NULL, DEFAULT now()                 |

**Indexes:** `idx_featured_hotels_order`, `idx_featured_hotels_active`

**RLS:** Public read, admin manages

---

### 13. `featured_rooms` — Manager-curated featured rooms

| Column        | Type        | Constraints                             |
|--------------|-------------|-----------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid()           |
| room_id      | uuid        | UNIQUE, REFERENCES rooms(id) on delete cascade |
| featured_order| int        | NOT NULL, DEFAULT 0                     |
| featured_at  | timestamptz | NOT NULL, DEFAULT now()                 |
| active       | boolean     | NOT NULL, DEFAULT true                  |

**Indexes:** `idx_featured_rooms_order`, `idx_featured_rooms_room`

**RLS:** Public read, admins/managers manage

---

### 14. `support_tickets` — Client support requests

| Column        | Type        | Constraints                             |
|--------------|-------------|-----------------------------------------|
| id           | uuid        | PK, DEFAULT gen_random_uuid()           |
| user_id      | uuid        | NOT NULL, REFERENCES users(id) on delete cascade |
| hotel_id     | uuid        | NOT NULL, REFERENCES hotels(id) on delete cascade |
| reservation_id| uuid       | REFERENCES reservations(id) on delete set null |
| subject      | text        | NOT NULL                                |
| description  | text        | NOT NULL                                |
| status       | text        | CHECK IN ('open', 'in_progress', 'resolved', 'closed'), DEFAULT 'open' |
| created_at   | timestamptz | DEFAULT now()                           |
| updated_at   | timestamptz | DEFAULT now()                           |

**RLS:**
- Clients insert/select own
- Owners select/update for their hotels
- Admin full access

---

### 15. `images` — Centralized image tracking (NEW)

| Column       | Type        | Constraints                                  |
|-------------|-------------|----------------------------------------------|
| id          | uuid        | PK, DEFAULT gen_random_uuid()                |
| entity_type | text        | NOT NULL, CHECK IN ('hotel', 'room', 'user') |
| entity_id   | uuid        | NOT NULL                                     |
| url         | text        | NOT NULL                                     |
| storage_path| text        | NOT NULL                                     |
| bucket      | text        | NOT NULL                                     |
| file_size   | int         |                                              |
| width       | int         |                                              |
| height      | int         |                                              |
| mime_type   | text        |                                              |
| is_cover    | boolean     | DEFAULT false                                |
| sort_order  | int         | NOT NULL, DEFAULT 0                          |
| uploaded_by | uuid        | REFERENCES users(id) on delete set null      |
| created_at  | timestamptz | NOT NULL, DEFAULT now()                      |

**Indexes:** `idx_images_entity`, `idx_images_cover`, `idx_images_storage_path`

**RLS Policies:**
- Public can view hotel and room images
- Users view own user images
- Authenticated users can insert
- Managers update/delete hotel/room images via ownership
- Users update/delete own user images
- Admin full access

**Trigger:** `trg_cleanup_image_storage` — Auto-deletes storage file when image record is deleted

---

## Storage Buckets

### `hotel-images`
- Public bucket, 10MB limit
- Allowed: png, jpeg, jpg, webp, gif
- Path format: `{hotelId}/{timestamp}.webp`

### `room-images`
- Public bucket, 10MB limit
- Allowed: png, jpeg, jpg, webp, gif
- Path format: `{roomId}/{timestamp}.webp`

### `avatars`
- Public bucket, 5MB limit
- Allowed: png, jpeg, jpg, webp, gif
- Path format: `{userId}/avatar.webp`

---

## Functions

- `handle_new_user()` — Trigger function: creates user profile on auth signup
- `update_updated_at_column()` — Generic trigger: updates `updated_at` on row change
- `get_hotel_manager_id(hotel_id uuid)` — SECURITY DEFINER: returns manager_id without triggering RLS (avoids infinite recursion)
- `check_branch_deletion()` — Prevents deleting main hotels that have branches
- `record_reservation_status_change()` — Audit trigger: logs status changes to history table
- `cleanup_image_storage()` — Deletes file from storage when image record is deleted
