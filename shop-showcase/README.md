# Everything in the Mountains (Option B: Dedicated Synthetic Showcase)

**Location:** `__PROJECT_DIR__/shop-showcase/`  
**Owner:** the owner  
**Operating Standard:** Anti-Slop Verification Harness & Capability Claim Schema  
**Status:** Built and checked  

---

## 1. Executive Purpose & Concept

Option B provides **Site 2: The Living Proof** in Alpine Wave's 3-part commercial funnel. 

While Site 1 (`alpine-wave-givingli-v3.html`) sells Alpine Wave to seasonal business operators in the Okanagan theme, **Site 2 represents a realistic, standalone winter rental and retail operation** named **Everything in the Mountains** (*"All about the mountains"*).

Prospective ski shop owners see how an assistant interacts with their actual customer base in a live e-commerce and rental environment.

---

## 2. Structured Synthetic Dataset Reused (`synthetic_shop_data.json`)

The entire storefront and customer bot run on our verified machine-readable catalog:

| Category | Models & Sizes | Daily Rate (CAD) | 3+ Day Rate (-15%) |
| :--- | :--- | :---: | :---: |
| **High-Performance Demo Skis** | Blizzard Rustler 9 & 10 (168–186cm), Armada ARV 106, Head Kore 93 | $75.00 | $63.75 |
| **Backcountry Splitboard Fleet** | Jones Solution & Weston Ridgeline (with skins & Spark R&D bindings) | $85.00 | $72.25 |
| **Standard Recreational Fleet** | Atomic Vantage & Salomon QST (skis, 4-buckle boots, poles) | $52.00 | $44.20 ($140 for 3 days) |
| **Junior Ski & Board Packages** | Shaped skis/grom board, boots, poles, certified helmet | $32.00 | $27.20 |
| **Avalanche Safety Gear** | BCA Tracker3 Digital Transceiver, 270cm probe, B-1 EXT shovel | $35.00 | $29.75 |

### Workshop & Overnight Tuning Menu:
- **Full Tune ($65 CAD):** Base repair, stone grind structure, ceramic edge bevel, and infrared (IR) heat wax. *Overnight guarantee: In by 5:00 PM, on the pick-up rack by 8:00 AM.*
- **Standard Tune ($45 CAD):** Edge sharpen, hot iron wax, scrape and buff.
- **Quick Wax ($25 CAD):** Hand-iron alpine wax, 15-minute turnaround while customer waits.
- **Binding Mount & DIN Calibration ($50 CAD):** Certified in-store ASTM torque bench calibration.

### Shop Logistics & Operating Rules:
- **Hours:** 8:00 AM – 6:00 PM daily (all statutory holidays).
- **Express Parking:** 15-minute rental loading stalls in rear alleyway behind 104 Whistler Way.
- **After-Hours Pickup Locker:** Heated secure locker at West Entrance with access code **4482**.
- **DIN Release Policy:** In-person technician inspection only with customer ski boots present. Under ASTM safety standards, DIN is never calibrated over phone or web chat.

---

## 3. Storefront Interactive Modules

1. **Mountain Conditions HUD:** Real-time alpine base depth (184cm), 24h powder (12cm), summit temperature (-4°C), and fleet readiness status.
2. **Category Filter Tabs:** Fast switching between Demo Skis, Splitboards, Recreational Fleet, Junior Packages, and Avalanche Rescue Gear.
3. **Dynamic Rental Rate Calculator:** Live calculation for 1–7 day rentals with automatic 15% discount on 3+ days, helmet/avalanche add-ons, and instant booking handoff.
4. **Embedded Alpine Wave Assistant Widget:** Floating launcher with unread notification badge, quick query chips, truth-bounded answer matching from `synthetic_shop_data.json`, and staff SMS escalation dispatch.
5. **Front Counter DID Phone Simulator:** Pairs with Okanagan DID `(236) 205-7030` to simulate sub-second conversational telephone answers to common customer questions.

---

## 4. Verification & Anti-Slop Audit

Audited against `eval_harness.py`:
- 0 blacklisted AI slop violations.
- Grounded in synthetic shop pricing, hours, and logistics catalog.
