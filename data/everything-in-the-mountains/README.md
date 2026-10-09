# Everything in the Mountains — showcase data

Synthetic data master and JSON export for Everything in the Mountains, the showcase mountain sports shop.

## What is the master

The master data file is the Excel workbook `Alpine_Wave_Synthetic_Mountain_Data.xlsx`. It holds 9 sheets:
1. `About`: shop identity, SYNTHETIC classification, hours, phone placeholder, operating seasons.
2. `Hardgoods_Sales`: winter skis, snowboards, boots, bindings, summer trail/enduro bikes, e-bikes, and bike racks.
3. `Softgoods_Apparel_Gear`: technical winter outerwear, gloves, goggles, helmets, summer riding jerseys/shorts, and hydration packs.
4. `Rental_Packages_Pricing`: seasonal rental rates for skis, snowboards, splitboards, avalanche kits, and summer mountain bikes/e-bikes.
5. `Rental_Fleet_Live_Inventory`: serialized fleet tracking with barcodes, models, condition ratings, and maintenance records.
6. `Workshop_Services_Menu`: full stone grind tunes, edge & wax, counter wax, mounts, and summer bike tuning/hydraulic brake services.
7. `Tours_and_Experiences`: cat-skiing, snowmobiling, snowshoe fondue, avalanche courses, summer lake charters, and winery e-bike tours.
8. `Bot_Rules_and_Policies`: approved facts, operating rules, cutoff times, temperature limits, and staff escalation triggers.
9. `Sales_Log`: 62 realistic sales and rental transaction rows across winter and summer seasons.

All prices match the showcase website (`shop-showcase/index.html`).

## Who reads it

- `Alpine_Wave_Synthetic_Mountain_Data.xlsx` is the master maintained via the generator script.
- `everything-in-the-mountains.json` is the structured JSON export read by the showcase website, shop concierge bot, and Jev test harnesses.

## How to rebuild the master

Run the generator script (requires Python and `openpyxl`):

```bash
python data/everything-in-the-mountains/generate_synthetic_mountain_data.py
```

Running the generator overwrites `Alpine_Wave_Synthetic_Mountain_Data.xlsx`.

## How to export the JSON

Run the export script:

```bash
python data/everything-in-the-mountains/export_json.py
```

This reads the workbook and writes `data/everything-in-the-mountains/everything-in-the-mountains.json`.

To verify the JSON loads cleanly:

```bash
python -c "import json;json.load(open('data/everything-in-the-mountains/everything-in-the-mountains.json',encoding='utf8'))"
```
