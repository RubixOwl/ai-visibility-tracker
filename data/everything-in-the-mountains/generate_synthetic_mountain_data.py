"""
Generator script to build a comprehensive, multi-tab synthetic data Excel workbook
for Everything in the Mountains (the showcase shop) covering all seasons:
retail hardgoods, softgoods, rental fleet, serialized units, workshop services,
guided tours, bot rules/policies, and a realistic multi-season sales log.
"""

import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def build_everything_in_the_mountains_excel():
    wb = Workbook()
    default_sheet = wb.active
    wb.remove(default_sheet)

    # Styles
    font_family = "Segoe UI"
    header_font = Font(name=font_family, size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1A365D", end_color="1A365D", fill_type="solid") # Deep Mountain Navy
    title_font = Font(name=font_family, size=14, bold=True, color="1A365D")
    subtitle_font = Font(name=font_family, size=9, italic=True, color="4A5568")

    regular_font = Font(name=font_family, size=10, color="2D3748")
    bold_font = Font(name=font_family, size=10, bold=True, color="2D3748")
    code_font = Font(name="Consolas", size=9, color="2B6CB0", bold=True)

    zebra_fill = PatternFill(start_color="F7FAFC", end_color="F7FAFC", fill_type="solid")
    white_fill = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")
    highlight_fill = PatternFill(start_color="EDF2F7", end_color="EDF2F7", fill_type="solid")

    # Status fills
    in_stock_fill = PatternFill(start_color="E6F4EA", end_color="E6F4EA", fill_type="solid")
    in_stock_font = Font(name=font_family, size=9, bold=True, color="137333")

    low_stock_fill = PatternFill(start_color="FEF7E0", end_color="FEF7E0", fill_type="solid")
    low_stock_font = Font(name=font_family, size=9, bold=True, color="B06000")

    out_stock_fill = PatternFill(start_color="FCE8E6", end_color="FCE8E6", fill_type="solid")
    out_stock_font = Font(name=font_family, size=9, bold=True, color="C5221F")

    rented_fill = PatternFill(start_color="EBF8FF", end_color="EBF8FF", fill_type="solid")
    rented_font = Font(name=font_family, size=9, bold=True, color="2B6CB0")

    border_thin = Border(
        left=Side(style='thin', color='E2E8F0'),
        right=Side(style='thin', color='E2E8F0'),
        top=Side(style='thin', color='E2E8F0'),
        bottom=Side(style='thin', color='E2E8F0')
    )

    header_border = Border(
        left=Side(style='thin', color='2A4365'),
        right=Side(style='thin', color='2A4365'),
        top=Side(style='medium', color='1A365D'),
        bottom=Side(style='medium', color='1A365D')
    )

    currency_format = "$#,##0.00"
    int_format = "#,##0"

    # =========================================================================
    # TAB 0: About (Cover Sheet)
    # =========================================================================
    ws0 = wb.create_sheet(title="About")
    ws0.views.sheetView[0].showGridLines = True

    about_headers = ["Field", "Information", "Operational Notes & System Context"]
    about_data = [
        ("Business Name", "Everything in the Mountains", "Showcase mountain sports shop (ski, snowboard, mountain bike, tours, workshop)."),
        ("Data Classification", "SYNTHETIC DATA: made-up showcase shop, not a real business", "Used to demonstrate website concierge, voice assistant, and Jev guardrails."),
        ("Contact Phone", "SECOND NUMBER (not yet set up)", "Dedicated showcase/demo phone number placeholder. Staffed during regular store hours."),
        ("Physical Location", "Village Slopeside & West Alley, Okanagan, British Columbia", "Gateway resort village location with slopeside ski racks and summer trail access."),
        ("Operating Hours", "8:00 AM – 6:00 PM daily in season, stat holidays included", "Consistent operating hours across full winter and summer operating periods."),
        ("Seasons Covered", "Winter, Summer, Shoulder / All Year", "Winter: Nov 15 – Apr 20 | Summer: May 15 – Sep 30 | Shoulder: Apr 21 – May 14 & Oct 1 – Nov 14."),
        ("Early Rental Pickup", "Complimentary 4:00 PM – 6:30 PM evening prior", "Guests grab gear the night before rental starts to hit first chair without waiting."),
        ("Late Arrival Pick-Up", "Heated West Entrance Locker (Keypad Code: 4482)", "After-hours gear access for guests arriving past 6:00 PM."),
        ("Workshop Guarantee", "In by 5:00 PM, ready by 8:00 AM next morning", "Full stone grind ($65), edge & wax ($45), counter wax ($25). 2-hr rush available (+$25)."),
        ("Cold Weather Operating Limits", "Tours run down to -25°C", "Heated gear supplied. Mountain or trail closure qualifies for 100% refund or free reschedule."),
        ("Air Quality Safety Policy", "AQHI 7+ safety reschedule / full credit", "Guests may reschedule or receive 100% store credit if wildfire smoke AQHI reaches 7 or higher."),
        ("Data Master Rule", "Master Workbook for Everything in the Mountains", "Rebuilt by generate_synthetic_mountain_data.py; exported to JSON via export_json.py.")
    ]

    ws0.append(["Everything in the Mountains — Master Shop Knowledge & About"])
    ws0.append(["Master record for showcase mountain sports business. SYNTHETIC DATA: made-up showcase shop, not a real business."])
    ws0.append([])
    ws0.append(about_headers)

    ws0["A1"].font = title_font
    ws0["A2"].font = subtitle_font

    for col_idx in range(1, len(about_headers) + 1):
        cell = ws0.cell(row=4, column=col_idx)
        cell.font = header_font
        cell.fill = header_fill
        cell.border = header_border
        cell.alignment = Alignment(horizontal="left", vertical="center")

    for row_idx, data_row in enumerate(about_data, start=5):
        ws0.append(list(data_row))
        curr_fill = zebra_fill if (row_idx % 2 == 0) else white_fill
        for col_idx in range(1, len(data_row) + 1):
            c = ws0.cell(row=row_idx, column=col_idx)
            c.font = bold_font if col_idx == 1 else regular_font
            c.fill = curr_fill
            c.border = border_thin
            if col_idx == 1:
                c.font = code_font

    ws0.freeze_panes = "A5"

    # =========================================================================
    # TAB 1: Hardgoods_Sales (Skis, Boards, Bikes, Boots, Bindings)
    # =========================================================================
    ws1 = wb.create_sheet(title="Hardgoods_Sales")
    ws1.views.sheetView[0].showGridLines = True

    hardgoods_headers = [
        "SKU", "Category", "Subcategory", "Brand", "Model", "Season",
        "Size / Length", "Terrain & Profile", "Flex Rating", "Specs / Waist",
        "MSRP (CAD)", "Retail Price (CAD)", "Wholesale (CAD)", "Qty On Hand",
        "Stock Status", "Floor Location", "UPC Barcode"
    ]

    hardgoods_data = [
        # Skis (Winter)
        ("SKI-SAL-QST98-169", "Skis", "All-Mountain Freeride", "Salomon", "QST 98", "Winter", "169 cm", "All-Terrain Rocker / Camber", "Medium-Stiff (7/10)", "98mm waist, C/FX Carbon, 16m radius", 899.99, 799.99, 440.00, 5, "In Stock", "Ski Wall Rack A1", "887850849101"),
        ("SKI-SAL-QST98-176", "Skis", "All-Mountain Freeride", "Salomon", "QST 98", "Winter", "176 cm", "All-Terrain Rocker / Camber", "Medium-Stiff (7/10)", "98mm waist, C/FX Carbon, 18m radius", 899.99, 799.99, 440.00, 8, "In Stock", "Ski Wall Rack A1", "887850849102"),
        ("SKI-SAL-QST98-183", "Skis", "All-Mountain Freeride", "Salomon", "QST 98", "Winter", "183 cm", "All-Terrain Rocker / Camber", "Medium-Stiff (7/10)", "98mm waist, C/FX Carbon, 19m radius", 899.99, 799.99, 440.00, 3, "In Stock", "Ski Wall Rack A1", "887850849103"),
        ("SKI-SAL-QST106-181", "Skis", "Powder / Big Mountain", "Salomon", "QST 106", "Winter", "181 cm", "Freeride Rocker / Camber", "Stiff (8/10)", "106mm waist, Cork Damplifier, 19m radius", 949.99, 849.99, 475.00, 2, "Low Stock", "Ski Wall Rack A2", "887850849104"),
        ("SKI-ATO-BENT100-172", "Skis", "All-Mountain Freestyle", "Atomic", "Bent 100", "Winter", "172 cm", "Powder Rocker 20/70/10", "Medium (6/10)", "100mm waist, HRZN Tech Tip/Tail, 18m", 799.99, 749.99, 400.00, 6, "In Stock", "Ski Wall Rack A3", "887850849105"),
        ("SKI-ATO-BENT100-180", "Skis", "All-Mountain Freestyle", "Atomic", "Bent 100", "Winter", "180 cm", "Powder Rocker 20/70/10", "Medium (6/10)", "100mm waist, HRZN Tech Tip/Tail, 19.5m", 799.99, 749.99, 400.00, 7, "In Stock", "Ski Wall Rack A3", "887850849106"),
        ("SKI-ATO-BENT110-180", "Skis", "Powder / Backcountry", "Atomic", "Bent Chetler 110", "Winter", "180 cm", "Powder Rocker", "Medium (6/10)", "110mm waist, Ultra Light Woodcore", 899.99, 829.99, 450.00, 1, "Low Stock", "Ski Wall Rack A3", "887850849107"),
        ("SKI-ROS-SND106-178", "Skis", "Freeride Charger", "Rossignol", "Sender 106 Ti Plus", "Winter", "178 cm", "Progressive Rocker", "Very Stiff (9/10)", "106mm waist, Titanal Beam, Air Tip", 1049.99, 949.99, 520.00, 4, "In Stock", "Ski Wall Rack A4", "887850849108"),
        ("SKI-ROS-EXP86-167", "Skis", "Frontside / All-Mountain", "Rossignol", "Experience 86 Basalt", "Winter", "167 cm", "All Trail Rocker", "Medium (6/10)", "86mm waist, Drive Tip Solution, 15m", 749.99, 679.99, 370.00, 4, "In Stock", "Ski Wall Rack A4", "887850849109"),
        ("SKI-VOL-M6-177", "Skis", "All-Mountain Expert", "Volkl", "M6 Mantra", "Winter", "177 cm", "Tip & Tail Rocker", "Stiff (8.5/10)", "96mm waist, Tailored Carbon Tips, 18m", 999.99, 899.99, 500.00, 3, "In Stock", "Ski Wall Rack A5", "887850849110"),
        ("SKI-VOL-SEC102-179", "Skis", "Freeride", "Volkl", "Secret 102 (Women)", "Winter", "179 cm", "Tip & Tail Rocker", "Stiff (8/10)", "102mm waist, Titanal Frame, 17m", 999.99, 899.99, 500.00, 2, "Low Stock", "Ski Wall Rack A5", "887850849111"),
        ("SKI-NOR-ENF94-172", "Skis", "All-Mountain Carve", "Nordica", "Enforcer 94", "Winter", "172 cm", "All Mountain Rocker", "Stiff (8/10)", "94mm waist, True Tip Carbon, 17.1m", 899.99, 829.99, 450.00, 5, "In Stock", "Ski Wall Rack A6", "887850849112"),
        ("SKI-NOR-ENF94-179", "Skis", "All-Mountain Carve", "Nordica", "Enforcer 94", "Winter", "179 cm", "All Mountain Rocker", "Stiff (8/10)", "94mm waist, Dual Metal Laminate, 18m", 899.99, 829.99, 450.00, 0, "Out of Stock", "Warehouse Bay W1", "887850849113"),
        ("SKI-BLI-RUS9-172", "Skis", "All-Mountain Playful", "Blizzard", "Rustler 9", "Winter", "172 cm", "Rocker-Camber-Rocker", "Medium-Stiff (7/10)", "96mm waist, FluxForm Titanal, 16m", 899.99, 849.99, 450.00, 4, "In Stock", "Ski Wall Rack A6", "887850849114"),
        ("SKI-BLI-RUS9-180", "Skis", "All-Mountain Playful", "Blizzard", "Rustler 9", "Winter", "180 cm", "Rocker-Camber-Rocker", "Medium-Stiff (7/10)", "96mm waist, FluxForm Titanal, 17m", 899.99, 849.99, 450.00, 3, "In Stock", "Ski Wall Rack A6", "887850849115"),
        ("SKI-ARM-ARV96-170", "Skis", "Park & All-Mountain", "Armada", "ARV 96", "Winter", "170 cm", "AR Freestyle Rocker", "Medium (6/10)", "96mm waist, Poplar Ash Core, 18.5m", 749.99, 699.99, 380.00, 5, "In Stock", "Ski Wall Rack A7", "887850849116"),
        ("SKI-ARM-ARW96-163", "Skis", "Park & All-Mountain (W)", "Armada", "ARW 96", "Winter", "163 cm", "AR Freestyle Rocker", "Medium (5.5/10)", "96mm waist, 2.5 Impact Edge, 17m", 749.99, 699.99, 380.00, 2, "Low Stock", "Ski Wall Rack A7", "887850849117"),
        ("SKI-K2-MIN99-178", "Skis", "All-Mountain Freeride", "K2", "Mindbender 99Ti", "Winter", "178 cm", "All-Terrain Rocker", "Stiff (8/10)", "99mm waist, Titanal Y-Beam, 19.6m", 899.99, 799.99, 440.00, 4, "In Stock", "Ski Wall Rack A8", "887850849118"),

        # Snowboards (Winter)
        ("SBD-BUR-CUSC-156", "Snowboards", "All-Mountain", "Burton", "Custom Camber", "Winter", "156 cm", "Traditional Camber", "Medium-Stiff (6.5/10)", "Directional Shape, Super Fly II 700G", 799.99, 749.99, 400.00, 6, "In Stock", "Snowboard Deck Bay B1", "887850849201"),
        ("SBD-BUR-CUSC-158W", "Snowboards", "All-Mountain (Wide)", "Burton", "Custom Camber Wide", "Winter", "158W cm", "Traditional Camber", "Medium-Stiff (7/10)", "Directional Shape, 262mm waist width", 819.99, 769.99, 410.00, 3, "In Stock", "Snowboard Deck Bay B1", "887850849202"),
        ("SBD-BUR-FLYK-154", "Snowboards", "All-Mountain Playful", "Burton", "Custom Flying V", "Winter", "154 cm", "Hybrid Rocker/Camber", "Medium (5.5/10)", "Catch-free rocker with camber pop", 799.99, 749.99, 400.00, 4, "In Stock", "Snowboard Deck Bay B1", "887850849203"),
        ("SBD-BUR-FEEL-146", "Snowboards", "All-Mountain (Women)", "Burton", "Feelgood Camber", "Winter", "146 cm", "Camber", "Medium-Stiff (6.5/10)", "Women-specific triax carbon I-Beam", 749.99, 699.99, 375.00, 2, "Low Stock", "Snowboard Deck Bay B2", "887850849204"),
        ("SBD-LIB-TRICE-157", "Snowboards", "Freeride / Freestyle", "Lib Tech", "T.Rice Pro HP", "Winter", "157 cm", "C2 Hybrid Rocker/Camber", "Medium-Stiff (7/10)", "Magne-Traction, Horsepower basalt", 829.99, 779.99, 420.00, 5, "In Stock", "Snowboard Deck Bay B2", "887850849205"),
        ("SBD-LIB-ORCA-153", "Snowboards", "Powder / Volume Shift", "Lib Tech", "T.Rice Apex Orca", "Winter", "153 cm", "C2X Rocker/Camber", "Stiff (8/10)", "Carbon over carbon, Whale tail, 267mm", 1199.99, 1099.99, 610.00, 2, "Low Stock", "Showcase Wall S1", "887850849206"),
        ("SBD-LIB-ORCA-156", "Snowboards", "Powder / Volume Shift", "Lib Tech", "T.Rice Apex Orca", "Winter", "156 cm", "C2X Rocker/Camber", "Stiff (8/10)", "Ultra lightweight, Magne-Traction", 1199.99, 1099.99, 610.00, 0, "Out of Stock", "Backorder ETA Oct 15", "887850849207"),
        ("SBD-JON-HOV2-156", "Snowboards", "Powder / Freeride", "Jones", "Hovercraft 2.0", "Winter", "156 cm", "Directional Rocker 3D Contour", "Medium-Stiff (7/10)", "3D Contour Base 3.0, Blunt nose", 799.99, 749.99, 400.00, 4, "In Stock", "Snowboard Deck Bay B3", "887850849208"),
        ("SBD-JON-MTWN-157", "Snowboards", "All-Mountain Twin", "Jones", "Mountain Twin", "Winter", "157 cm", "CamRock Profile", "Medium (6/10)", "Directional Twin, Traction Tech 3.0", 729.99, 679.99, 365.00, 5, "In Stock", "Snowboard Deck Bay B3", "887850849209"),
        ("SBD-JON-STRS-149", "Snowboards", "All-Mountain (Women)", "Jones", "Stratos Women's", "Winter", "149 cm", "Directional Rocker", "Medium-Stiff (7/10)", "Tapered 10mm, Carbon stringers", 799.99, 749.99, 400.00, 3, "In Stock", "Snowboard Deck Bay B3", "887850849210"),
        ("SBD-RID-SHAD-154", "Snowboards", "All-Mountain", "Ride", "Shadowban", "Winter", "154 cm", "Standard Camber", "Medium (5/10)", "Carbon Slimewalls, Quadratic Sidecut", 679.99, 629.99, 340.00, 4, "In Stock", "Snowboard Deck Bay B4", "887850849211"),
        ("SBD-RID-WARP-151", "Snowboards", "Volume Shift / Carve", "Ride", "Warpig", "Winter", "151 cm (Medium)", "Directional Flat Rocker", "Medium-Stiff (7/10)", "Tapered Bi-Radial Sidecut, 265mm", 729.99, 679.99, 365.00, 3, "In Stock", "Snowboard Deck Bay B4", "887850849212"),

        # Boots & Bindings (Winter)
        ("BOT-ATO-HAWX120-265", "Ski Boots", "All-Mountain Performance", "Atomic", "Hawx Prime 120 S GW", "Winter", "Mondo 26.5 (US 8.5)", "100mm Medium Last, GripWalk", "Stiff (120 Flex)", "Prolite Construction, Memory Fit 3D", 849.99, 769.99, 425.00, 4, "In Stock", "Boot Fitting Bench C1", "887850849301"),
        ("BOT-ATO-HAWX120-275", "Ski Boots", "All-Mountain Performance", "Atomic", "Hawx Prime 120 S GW", "Winter", "Mondo 27.5 (US 9.5)", "100mm Medium Last, GripWalk", "Stiff (120 Flex)", "Prolite Construction, Mimic Platinum", 849.99, 769.99, 425.00, 5, "In Stock", "Boot Fitting Bench C1", "887850849302"),
        ("BOT-SAL-SMAX110-255", "Ski Boots", "Piste / Precision", "Salomon", "S/Pro Alpha 110 GW", "Winter", "Mondo 25.5 (US 7.5)", "98mm Narrow Last, GripWalk", "Medium-Stiff (110 Flex)", "3D Instep shell, Custom Shell HD", 799.99, 729.99, 400.00, 3, "In Stock", "Boot Fitting Bench C2", "887850849305"),
        ("BOT-BUR-IONB-100", "Snowboard Boots", "All-Mountain Stiff", "Burton", "Ion BOA Snowboard Boot", "Winter", "US Men 10.0", "Dual Zone High-Power BOA", "Very Stiff (8.5/10)", "Life Liner, AutoCANT EST, ReBounce", 799.99, 749.99, 400.00, 3, "In Stock", "Boot Fitting Bench C4", "887850849401"),
        ("BIN-LOK-PIV15-115", "Ski Bindings", "Freeride / Park", "Look", "Pivot 15 GW (Raw)", "Winter", "Brake 115mm", "Turntable Heel, GripWalk", "DIN 6 - 15", "Full aluminum toe, 7 points of contact", 499.99, 449.99, 250.00, 8, "In Stock", "Binding Shelf D1", "887850849501"),
        ("BIN-UNI-FORC-M", "Snowboard Bindings", "All-Mountain", "Union", "Force Classic Bindings", "Winter", "Medium (US 8 - 10)", "Stage 4 Duraflex ST Baseplate", "Medium-Stiff (7/10)", "Magnesium ratchets, Extruded 3D heelcup", 359.99, 329.99, 180.00, 6, "In Stock", "Binding Shelf D2", "887850849504"),

        # Summer Mountain Bikes & E-Bikes (Summer)
        ("BIK-TRE-FUE7-M", "Bikes", "Full Suspension Trail MTB", "Trek", "Fuel EX 7 Gen 6", "Summer", "Size M (29\")", "Trail / 140mm Travel", "Medium (Tune M)", "Fox Float EVOL, Shimano Deore 12-spd", 3899.99, 3599.99, 2100.00, 3, "In Stock", "Bike Showroom Bay 1", "887850849601"),
        ("BIK-TRE-FUE7-L", "Bikes", "Full Suspension Trail MTB", "Trek", "Fuel EX 7 Gen 6", "Summer", "Size L (29\")", "Trail / 140mm Travel", "Medium (Tune L)", "Fox Float EVOL, Shimano Deore 12-spd", 3899.99, 3599.99, 2100.00, 4, "In Stock", "Bike Showroom Bay 1", "887850849602"),
        ("BIK-SPE-STUM-S3", "Bikes", "Enduro / All-Mountain MTB", "Specialized", "Stumpjumper EVO Comp", "Summer", "S3 (Medium-Large)", "All-Mountain / 150mm Travel", "Progressive Enduro", "SWAT door, SRAM GX Eagle 12-spd", 4999.99, 4599.99, 2750.00, 2, "In Stock", "Bike Showroom Bay 2", "887850849603"),
        ("BIK-SPE-LEVO-M", "Bikes", "Electric Mountain Bike (E-MTB)", "Specialized", "Turbo Levo Alloy", "Summer", "Size M (29\")", "Trail E-MTB 150mm", "Custom Trail Rx", "700Wh battery, 90Nm motor, 4-piston disc", 7499.99, 6999.99, 4200.00, 2, "Low Stock", "E-Bike Feature Display", "887850849604"),
        ("BIK-GIA-ROAM-L", "Bikes", "Pathway & Gravel Cruiser", "Giant", "Roam Disc 2", "Summer", "Size L (700c)", "Paved & Hardpack Gravel", "Comfort / Active", "Hydraulic disc brakes, 63mm lockout fork", 949.99, 879.99, 520.00, 5, "In Stock", "Bike Showroom Bay 3", "887850849605"),
        ("BIK-NOR-FLUID-Y", "Bikes", "Youth Trail Mountain Bike", "Norco", "Fluid FS 20", "Summer", "20\" Wheels", "Youth Full Suspension", "Youth Tuned Air", "100mm air fork, hydraulic disc brakes", 1699.99, 1549.99, 920.00, 3, "In Stock", "Youth Bike Wall", "887850849606"),

        # Year-Round Components / Electronics (All year)
        ("ACC-THU-PROR-UNV", "Accessories", "Bike Car Rack", "Thule", "T2 Pro XTR 2-Bike Hitch Rack", "All year", "2-Inch Receiver", "Hitch Platform Mount", "Heavy Duty (60 lb/bike)", "Integrated transport wheels, cable locks", 1099.99, 999.99, 620.00, 3, "In Stock", "Rack Storage R1", "887850849607"),
        ("ACC-GAR-EDGE-540", "Accessories", "GPS Cycling & Trail Computer", "Garmin", "Edge 540 Solar", "All year", "Compact", "Multi-Band GNSS Navigation", "Rugged All-Weather", "Solar charging, topographic trail maps", 599.99, 549.99, 340.00, 4, "In Stock", "Electronics Showcase", "887850849608"),
    ]

    ws1.append(["Everything in the Mountains — Retail Hardgoods Inventory"])
    ws1.append(["Current active stock for in-store and online retail sales covering Winter, Summer, and All-year equipment. All prices CAD."])
    ws1.append([])
    ws1.append(hardgoods_headers)

    ws1["A1"].font = title_font
    ws1["A2"].font = subtitle_font

    for col_idx in range(1, len(hardgoods_headers) + 1):
        cell = ws1.cell(row=4, column=col_idx)
        cell.font = header_font
        cell.fill = header_fill
        cell.border = header_border
        cell.alignment = Alignment(horizontal="center" if "Price" in hardgoods_headers[col_idx-1] or "Qty" in hardgoods_headers[col_idx-1] or "Status" in hardgoods_headers[col_idx-1] or "Season" in hardgoods_headers[col_idx-1] else "left", vertical="center")

    for row_idx, data_row in enumerate(hardgoods_data, start=5):
        ws1.append(list(data_row))
        curr_fill = zebra_fill if (row_idx % 2 == 0) else white_fill

        for col_idx in range(1, len(data_row) + 1):
            c = ws1.cell(row=row_idx, column=col_idx)
            c.font = regular_font
            c.fill = curr_fill
            c.border = border_thin

            val = c.value
            header_name = hardgoods_headers[col_idx - 1]

            if "CAD" in header_name:
                c.number_format = currency_format
                c.alignment = Alignment(horizontal="right")
            elif "Qty" in header_name:
                c.number_format = int_format
                c.alignment = Alignment(horizontal="center")
            elif header_name == "SKU":
                c.font = code_font
            elif header_name == "Season":
                c.alignment = Alignment(horizontal="center")
                c.font = bold_font
            elif header_name == "Stock Status":
                c.alignment = Alignment(horizontal="center")
                if val == "In Stock":
                    c.fill = in_stock_fill
                    c.font = in_stock_font
                elif val == "Low Stock":
                    c.fill = low_stock_fill
                    c.font = low_stock_font
                elif val == "Out of Stock":
                    c.fill = out_stock_fill
                    c.font = out_stock_font

    ws1.freeze_panes = "A5"

    # =========================================================================
    # TAB 2: Softgoods_Outerwear_Gear
    # =========================================================================
    ws2 = wb.create_sheet(title="Softgoods_Apparel_Gear")
    ws2.views.sheetView[0].showGridLines = True

    softgoods_headers = [
        "SKU", "Department", "Brand", "Product Name", "Season", "Gender / Fit",
        "Size", "Colorway", "Waterproof / Tech Specs", "Warmth / Lining",
        "MSRP (CAD)", "Retail Price (CAD)", "Qty On Hand", "Stock Status", "Aisle Location"
    ]

    softgoods_data = [
        # Winter Outerwear & Layering
        ("APP-ARC-BETAR-M-TL", "Outerwear Jackets", "Arc'teryx", "Beta AR Jacket", "Winter", "Men's Regular", "M", "Alpine Teal", "GORE-TEX Pro Most Rugged 3L, 28,000mm", "Uninsulated Shell (Layering Piece)", 850.00, 850.00, 4, "In Stock", "Outerwear Pod A - Arc'teryx Wall"),
        ("APP-ARC-BETAR-L-TL", "Outerwear Jackets", "Arc'teryx", "Beta AR Jacket", "Winter", "Men's Regular", "L", "Alpine Teal", "GORE-TEX Pro Most Rugged 3L, 28,000mm", "Uninsulated Shell (Layering Piece)", 850.00, 850.00, 3, "In Stock", "Outerwear Pod A - Arc'teryx Wall"),
        ("APP-ARC-SABR-M-OR", "Outerwear Jackets", "Arc'teryx", "Sabre SV Jacket", "Winter", "Men's Freeride", "M", "Relic Gold / Orange", "N100D Most Rugged 3L GORE-TEX", "Flannel Backer light insulation", 1100.00, 1100.00, 2, "Low Stock", "Outerwear Pod A - Arc'teryx Wall"),
        ("APP-PAT-POWB-M-NV", "Outerwear Pants", "Patagonia", "Powder Town Bib Pants", "Winter", "Men's Standard", "M", "Smolder Navy", "H2No Performance 2L Post-Consumer Recycled", "Taffeta lining, 60g Thermogreen knees", 429.00, 389.00, 6, "In Stock", "Outerwear Pod B - Patagonia"),
        ("APP-PAT-DOWN-M-BK", "Insulation & Midlayers", "Patagonia", "Down Sweater Hoody", "All year", "Men's Regular", "M", "Black", "NetPlus 100% recycled nylon ripstop, DWR", "800-fill-power 100% Responsible Down", 399.00, 359.00, 7, "In Stock", "Outerwear Pod B - Patagonia"),
        ("APP-BUR-AKCY-M-BK", "Outerwear Jackets", "Burton [ak]", "[ak] Cyclic GORE-TEX 2L Jacket", "Winter", "Men's Articulated", "M", "True Black", "GORE-TEX 2-Layer 70D with GORE-SEAM tape", "Living Lining mapped with soft taffeta", 599.99, 549.99, 6, "In Stock", "Outerwear Pod C - Burton [ak]"),
        ("APP-HH-ALPH-L-RD", "Outerwear Jackets", "Helly Hansen", "Alpha 4.0 Insulated Ski Jacket", "Winter", "Men's Fitted", "L", "Alert Red", "HELLY TECH Professional 4-way stretch", "PrimaLoft Gold Cross Core + H2Flow venting", 650.00, 585.00, 4, "In Stock", "Outerwear Pod D - Helly Hansen"),
        ("GLV-HES-ARMY-09", "Gloves & Mitts", "Hestra", "Army Leather Heli Ski 3-Finger", "Winter", "Unisex", "Size 9 (Large)", "Black / Off-White", "Army Goat Leather palm + Triton 3L windproof", "Removable Bemberg fleece / G-Loft insulation", 215.00, 195.00, 8, "In Stock", "Accessory Gondola G1"),
        ("GOG-OAK-FLTL-SAP", "Goggles & Eyewear", "Oakley", "Flight Deck L Goggles", "Winter", "Large Fit (Unisex)", "Large", "Matte White / Prizm Sapphire", "Prizm Snow Sapphire Iridium (13% VLT - Sun/Clouds)", "Ridgelock lens system, F3 Anti-fog", 315.00, 285.00, 6, "In Stock", "Goggle Display Showcase"),
        ("GOG-SMI-4DMG-EVR", "Goggles & Eyewear", "Smith", "4D MAG ChromaPop Goggles", "Winter", "Medium/Large Fit", "M/L", "Blackout / Everyday Green Mirror", "BirdsEye Vision curvature + Bonus Storm Rose Flash", "Smith MAG magnetic quick lens change", 440.00, 399.00, 4, "In Stock", "Goggle Display Showcase"),
        ("HLM-SMI-VANT-M", "Helmets & Protection", "Smith", "Vantage MIPS Helmet", "Winter", "Unisex Adult", "M (55-59cm)", "Matte Charcoal", "Koroyd energy-absorbing zone, Dual BOA 360", "21 adjustable vents, Snapfit SL2 ear pads", 360.00, 325.00, 6, "In Stock", "Helmet Rack H1"),
        ("BAS-SMW-TOP2-M", "Base & First Layers", "Smartwool", "Classic Thermal Merino 250 Crew Top", "All year", "Men's Slim Fit", "M", "Black / Charcoal", "100% Merino Wool, 250 g/m² interlock knit", "Next-to-skin moisture wicking and anti-odor", 155.00, 140.00, 12, "In Stock", "Base Layer Gondola B1"),
        ("SOX-DAR-SKI1-L", "Socks & Footwear", "Darn Tough", "RFL OTC Ultra-Lightweight Ski Sock", "Winter", "Unisex", "L (US 10-12)", "Nordic Teal", "True Seamless, Merino Wool / Nylon / Lycra", "Guaranteed for life, zero-bunch blister prevention", 38.00, 34.00, 24, "In Stock", "Sock Carousel S1"),
        ("SAF-BCA-TRK4-PKG", "Avalanche Safety", "BCA", "Tracker4 Avalanche Safety Package", "Winter", "Safety Gear", "Kit", "Hi-Vis Orange", "Tracker4 3-Antenna Digital Transceiver / Beacon", "Includes 270cm Stealth Probe & B-1 EXT Shovel", 575.00, 529.00, 5, "In Stock", "Backcountry Counter Safe"),
        ("SAF-MAM-AIR3-30L", "Avalanche Safety", "Mammut", "Ride Protection Airbag 3.0 (30L)", "Winter", "Backpack", "30L", "Sapphire / Black", "Removable Airbag System 3.0, Traumatic head protect", "Aluminum frame, avalanche tool pocket (Cannister sep)", 980.00, 899.00, 2, "Low Stock", "Backcountry Counter Safe"),

        # Summer Riding Apparel & Gear
        ("APP-FOX-DEFF-M-BK", "Summer Riding Gear", "Fox Racing", "Defend Kevlar Mountain Bike Pants", "Summer", "Men's Athletic", "M", "Black", "TruMotion all-way stretch with Cordura panels", "Breathable laser-cut cooling perforations", 199.95, 179.95, 8, "In Stock", "Summer Apparel Pod 1"),
        ("APP-FOX-FLEX-L-TL", "Summer Riding Gear", "Fox Racing", "Flexair Long Sleeve MTB Jersey", "Summer", "Men's Regular", "L", "Teal / Grey", "TruDri moisture wicking, abrasion-resistant shoulders", "Ultralight breathable mesh body", 109.95, 99.95, 10, "In Stock", "Summer Apparel Pod 1"),
        ("APP-PAT-SUNH-M-GY", "Sun & Trail Apparel", "Patagonia", "Capilene Cool Daily Sun Hoody", "Summer", "Unisex Regular", "M", "Feather Grey", "50+ UPF sun protection, HeiQ Pure odor control", "Ultralight next-to-skin cooling fabric", 89.00, 79.00, 14, "In Stock", "Trail Apparel Pod 2"),
        ("GLV-FOX-RANG-09", "Summer Gloves", "Fox Racing", "Ranger Mountain Bike Gel Gloves", "Summer", "Unisex", "Size 9 (Large)", "Black / Olive", "4-way stretch poly, conductive touchscreen thread", "Strategically placed TruGel palm protection", 44.95, 39.95, 15, "In Stock", "Accessory Carousel A1"),
        ("HLM-POC-KORT-M", "Summer Helmets", "POC", "Kortal Race MIPS Bike Helmet", "Summer", "Unisex Adult", "M/L (55-58cm)", "Hydrogen White", "Extended enduro coverage, twICEme NFC Medical ID", "Aramid bridge protection, unhindered goggle fit", 310.00, 279.00, 6, "In Stock", "Bike Helmet Rack B1"),
        ("HYD-CAM-MULE-12L", "Hydration & Trail Packs", "CamelBak", "M.U.L.E. Pro 14 Hydration Pack", "Summer", "Unisex", "14L (3L Reservoir)", "Gunmetal", "Air Support Pro back panel, 3L Crux reservoir", "Integrated bike multi-tool roll organizer", 199.99, 179.99, 8, "In Stock", "Pack Display Wall"),

        # Year-Round Trail & Travel Accessories
        ("SOX-DAR-HIK1-L", "Socks & Footwear", "Darn Tough", "Hiker Micro Crew Cushion Sock", "All year", "Unisex", "L (US 10-12)", "Denim Blue", "Merino Wool / Nylon / Lycra Spandex", "All-weather performance, lifetime guarantee", 32.00, 28.00, 25, "In Stock", "Sock Carousel S1"),
        ("BOT-YET-RAMB-26OZ", "Bottles & Flasks", "YETI", "Rambler 26 oz Bottle with Chug Cap", "All year", "Unisex", "26 oz", "Navy", "18/8 Kitchen-grade stainless, double-wall vacuum", "Keeps ice cold 24h / liquids hot 12h", 55.00, 48.00, 20, "In Stock", "Accessories Gondola G2"),
    ]

    ws2.append(["Everything in the Mountains — Softgoods, Apparel & Protective Gear"])
    ws2.append(["Technical outerwear, summer riding kits, protective optics, helmets, and hydration gear. All prices CAD."])
    ws2.append([])
    ws2.append(softgoods_headers)

    ws2["A1"].font = title_font
    ws2["A2"].font = subtitle_font

    for col_idx in range(1, len(softgoods_headers) + 1):
        cell = ws2.cell(row=4, column=col_idx)
        cell.font = header_font
        cell.fill = header_fill
        cell.border = header_border
        cell.alignment = Alignment(horizontal="center" if "CAD" in softgoods_headers[col_idx-1] or "Qty" in softgoods_headers[col_idx-1] or "Status" in softgoods_headers[col_idx-1] or "Season" in softgoods_headers[col_idx-1] else "left", vertical="center")

    for row_idx, data_row in enumerate(softgoods_data, start=5):
        ws2.append(list(data_row))
        curr_fill = zebra_fill if (row_idx % 2 == 0) else white_fill

        for col_idx in range(1, len(data_row) + 1):
            c = ws2.cell(row=row_idx, column=col_idx)
            c.font = regular_font
            c.fill = curr_fill
            c.border = border_thin

            val = c.value
            header_name = softgoods_headers[col_idx - 1]

            if "CAD" in header_name:
                c.number_format = currency_format
                c.alignment = Alignment(horizontal="right")
            elif "Qty" in header_name:
                c.number_format = int_format
                c.alignment = Alignment(horizontal="center")
            elif header_name == "SKU":
                c.font = code_font
            elif header_name == "Season":
                c.alignment = Alignment(horizontal="center")
                c.font = bold_font
            elif header_name == "Stock Status":
                c.alignment = Alignment(horizontal="center")
                if val == "In Stock":
                    c.fill = in_stock_fill
                    c.font = in_stock_font
                elif val == "Low Stock":
                    c.fill = low_stock_fill
                    c.font = low_stock_font
                elif val == "Out of Stock":
                    c.fill = out_stock_fill
                    c.font = out_stock_font

    ws2.freeze_panes = "A5"

    # =========================================================================
    # TAB 3: Rental_Packages_Pricing
    # =========================================================================
    ws3 = wb.create_sheet(title="Rental_Packages_Pricing")
    ws3.views.sheetView[0].showGridLines = True

    rental_pkg_headers = [
        "Package Code", "Package Name", "Season", "Rider Target & Skill", "Items Included",
        "1-Day Rate (CAD)", "2-Day Rate (CAD)", "3-Day Rate (CAD)", "Extra Day (CAD)",
        "7-Day Week (CAD)", "Damage Waiver / Day", "Early Pickup Permitted", "Key Policy & Booking Notes"
    ]

    rental_pkg_data = [
        # Winter Packages (Prices adjusted to match showcase site!)
        ("RNT-DEMO-SKI", "Demo High-Performance Ski Package", "Winter", "Advanced to Expert (Test season's top retail fleet)", "Current year demo skis (Salomon QST, Atomic Bent, Volkl M6), 4-buckle GW boots, carbon poles", 75.00, 140.00, 195.00, 52.00, 375.00, 5.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Matches website rate ($75/day). Swap models anytime. Pre-auth deposit $250."),
        ("RNT-PERF-SKI", "Performance All-Mountain Ski Package", "Winter", "Intermediate to Advanced", "All-mountain shaped skis (84-92mm waist), comfort performance boots, lightweight poles", 64.00, 118.00, 168.00, 45.00, 320.00, 5.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Great for groomers and fresh mountain chop. Custom DIN calibration."),
        ("RNT-REC-SKI", "Standard Sport Recreational Ski Package", "Winter", "Beginner to Novice", "Easy-turning progressive carver skis, easy-entry heated liner boots, standard poles", 52.00, 96.00, 138.00, 38.00, 260.00, 5.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Website baseline rate ($52/day). Forgiving flex, catch-free tips."),
        ("RNT-DEMO-SNB", "Demo Snowboard Package", "Winter", "Intermediate to Expert powder / freestyle riders", "Current year Lib Tech Orca, Burton Custom, Jones Mountain Twin, high-response bindings & boots", 78.00, 145.00, 205.00, 55.00, 395.00, 5.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Option to try Burton Step On boot/binding combo. Swaps allowed."),
        ("RNT-REC-SNB", "Standard Sport Snowboard Package", "Winter", "Beginner to Novice riders", "Catch-free rocker/flat snowboard, forgiving medium flex boots, padded adjustable bindings", 52.00, 96.00, 138.00, 38.00, 260.00, 5.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Includes regular or goofy stance preset to rider specs ($52/day)."),
        ("RNT-JR-SKI", "Junior Mountain Ski Package (Ages 12 & Under)", "Winter", "Kids / Youth beginner to intermediate", "Junior progressive skis (70-130cm), junior ergonomic boots, junior poles", 32.00, 58.00, 82.00, 22.00, 155.00, 3.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Matches website rate ($32/day). Parent/guardian digital waiver mandatory in BC."),
        ("RNT-JR-SNB", "Junior Grom Snowboard Package (Ages 12 & Under)", "Winter", "Kids / Youth beginner to intermediate", "Junior soft-flex board (90-130cm), easy-pull youth boots, lightweight single-strap bindings", 32.00, 58.00, 82.00, 22.00, 155.00, 3.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Matches website rate ($32/day). Parent/guardian digital waiver mandatory in BC."),
        ("RNT-TOURING", "Alpine Touring / Splitboard Backcountry Package", "Winter", "Backcountry certified riders only", "AT Skis with tech pin bindings or Jones Splitboard with skins, collapsible poles, crampons", 85.00, 158.00, 225.00, 60.00, 435.00, 8.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Matches website rate ($85/day). Backcountry safety gear rented separately or as add-on."),
        ("RNT-AVALANCHE", "BCA Tracker3 Avalanche Safety Kit Package", "Winter", "Backcountry & off-piste skiers & riders", "BCA Tracker3 digital 3-antenna beacon, 270cm aluminum quick-deploy probe, B-1 EXT shovel", 35.00, 65.00, 90.00, 25.00, 175.00, 3.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Matches website rate ($35/day). Fresh alkaline batteries checked prior to dispatch."),
        ("RNT-XC-NORDIC", "Nordic Cross-Country Classic Track Package", "Winter", "All ages cross-country trail touring", "Skin-grip classic waxless touring skis, NNN boots, lightweight composite Nordic poles", 35.00, 65.00, 90.00, 25.00, 170.00, 3.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Perfect for sovereign lake & local valley trail networks."),
        ("RNT-SNOWSHOE", "Tubbs Trail Snowshoe Package", "Winter", "All fitness levels", "Tubbs lightweight aluminum frame snowshoes with active fit bindings, adjustable poles", 24.00, 42.00, 60.00, 16.00, 110.00, 2.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Compatible with any waterproof winter hiking boot or snowboard boot."),
        ("RNT-BOOT-ONLY", "Boot-Only Rental (Ski Boots or Snowboard Boots)", "Winter", "Guests who bring their own skis/board", "Sanitized thermo-moldable ski boots (GripWalk) or dual-zone BOA snowboard boots", 28.00, 52.00, 72.00, 20.00, 135.00, 3.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Requires complimentary DIN release check if using customer's skis ($15 fee waived)."),
        ("RNT-SKI-ONLY", "Ski or Snowboard Only (Demo / Sport)", "Winter", "Guests who bring their own fitted boots", "Skis + poles or Snowboard deck with bindings mounted to guest's sole length", 45.00, 82.00, 118.00, 32.00, 220.00, 4.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Boot sole inspection required before dispatch."),
        ("RNT-HELMET", "MIPS Safety Helmet Rental", "Winter", "All skiers & boarders", "Sanitized Smith / Anon MIPS multi-impact certified helmet with fresh washable thermal liner", 12.00, 22.00, 30.00, 8.00, 55.00, 0.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Sizes XS through XL available. Highly recommended for all guests."),

        # Summer Bike Packages
        ("RNT-MTB-ENDURO", "Full Suspension Enduro / All-Mountain MTB", "Summer", "Intermediate to Expert trail and bike park riders", "Trek Fuel EX or Specialized Stumpjumper, Fox suspension tuned to weight, flat or SPD pedals, helmet", 85.00, 155.00, 220.00, 60.00, 425.00, 8.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Suspension setup and sag calibrated at pickup. Pre-auth deposit $250."),
        ("RNT-BIKE-EMTB", "Premium Specialized Turbo Levo E-MTB", "Summer", "All levels looking to climb further and explore mountain ridges", "Specialized Turbo Levo with 700Wh battery, charger, handlebar display, certified enduro helmet, repair kit", 115.00, 210.00, 295.00, 80.00, 575.00, 12.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Includes charging cable and route recommendations for high alpine loops."),
        ("RNT-BIKE-VALLEY", "Valley Pathway & Rail Trail Cruiser", "Summer", "Families and casual scenic cruisers", "Giant Roam Disc cruiser with comfort saddle, bell, rear rack, pannier bag, cable lock, pathway helmet", 45.00, 80.00, 115.00, 30.00, 215.00, 4.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Ideal for Okanagan Rail Trail winery cruises. Easy step-through options available."),
        ("RNT-BIKE-JR", "Junior Mountain Bike Package (Ages 6-12)", "Summer", "Kids trail and pump track riders", "Norco Fluid 20/24\" youth trail bike with front suspension, hand disc brakes, youth helmet", 32.00, 58.00, 82.00, 22.00, 155.00, 3.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Sized and tested in-store with our youth mechanics. Digital waiver required."),
        ("RNT-BIKE-PADS", "Downhill Bike Protection & Pad Set", "Summer", "Bike park and technical downhill riders", "Fox Racing knee guards, elbow pads, full-face certified downhill helmet, protective gloves", 15.00, 26.00, 36.00, 10.00, 70.00, 0.00, "Yes (4:00 PM - 6:30 PM eve prior)", "Sanitized after each rental. Fresh liner inserts.")
    ]

    ws3.append(["Everything in the Mountains — Rental Fleet Rate Card & Package Policies"])
    ws3.append(["Approved seasonal rental rates, multi-day discounts, early pickup terms, and damage waiver options. All prices CAD."])
    ws3.append([])
    ws3.append(rental_pkg_headers)

    ws3["A1"].font = title_font
    ws3["A2"].font = subtitle_font

    for col_idx in range(1, len(rental_pkg_headers) + 1):
        cell = ws3.cell(row=4, column=col_idx)
        cell.font = header_font
        cell.fill = header_fill
        cell.border = header_border
        cell.alignment = Alignment(horizontal="center" if "Rate" in rental_pkg_headers[col_idx-1] or "CAD" in rental_pkg_headers[col_idx-1] or "Pickup" in rental_pkg_headers[col_idx-1] or "Season" in rental_pkg_headers[col_idx-1] else "left", vertical="center")

    for row_idx, data_row in enumerate(rental_pkg_data, start=5):
        ws3.append(list(data_row))
        curr_fill = zebra_fill if (row_idx % 2 == 0) else white_fill

        for col_idx in range(1, len(data_row) + 1):
            c = ws3.cell(row=row_idx, column=col_idx)
            c.font = regular_font
            c.fill = curr_fill
            c.border = border_thin

            val = c.value
            header_name = rental_pkg_headers[col_idx - 1]

            if "Rate" in header_name or "CAD" in header_name or "Waiver" in header_name:
                c.number_format = currency_format
                c.alignment = Alignment(horizontal="right")
            elif header_name == "Package Code":
                c.font = code_font
            elif header_name == "Season":
                c.alignment = Alignment(horizontal="center")
                c.font = bold_font
            elif "Pickup" in header_name:
                c.alignment = Alignment(horizontal="center")
                c.font = in_stock_font

    ws3.freeze_panes = "A5"

    # =========================================================================
    # TAB 4: Rental_Fleet_Live_Inventory
    # =========================================================================
    ws4 = wb.create_sheet(title="Rental_Fleet_Live_Inventory")
    ws4.views.sheetView[0].showGridLines = True

    fleet_headers = [
        "Fleet Barcode", "Category", "Package Tier", "Season", "Brand", "Model",
        "Length / Size", "Binding Setup", "Sole Adjustment Range", "Current Status",
        "Condition Rating", "Cumulative Days Rented", "Storage Bay / Rack", "Last Tuned Date"
    ]

    fleet_data = [
        # Skis in Fleet (Winter)
        ("EIM-FLT-SK-0101", "Ski", "Demo", "Winter", "Salomon", "QST 98 Demo", "169 cm", "Salomon Warden 11 Demo GW", "260mm - 380mm", "Available", "A+ (Like New)", 4, "Rental Rack 1-A", "2026-09-28"),
        ("EIM-FLT-SK-0102", "Ski", "Demo", "Winter", "Salomon", "QST 98 Demo", "176 cm", "Salomon Warden 11 Demo GW", "260mm - 380mm", "Available", "A (Great)", 12, "Rental Rack 1-A", "2026-09-27"),
        ("EIM-FLT-SK-0103", "Ski", "Demo", "Winter", "Salomon", "QST 98 Demo", "176 cm", "Salomon Warden 11 Demo GW", "260mm - 380mm", "Rented", "A (Great)", 19, "With Customer #8419", "2026-09-25"),
        ("EIM-FLT-SK-0104", "Ski", "Demo", "Winter", "Atomic", "Bent 100 Demo", "172 cm", "Atomic Strive 13 Demo GW", "260mm - 385mm", "Available", "A+ (Like New)", 6, "Rental Rack 1-B", "2026-09-28"),
        ("EIM-FLT-SK-0105", "Ski", "Demo", "Winter", "Atomic", "Bent 100 Demo", "180 cm", "Atomic Strive 13 Demo GW", "260mm - 385mm", "Available", "A (Great)", 15, "Rental Rack 1-B", "2026-09-26"),
        ("EIM-FLT-SK-0106", "Ski", "Demo", "Winter", "Volkl", "M6 Mantra Demo", "177 cm", "Marker Griffon 13 Demo ID", "265mm - 375mm", "Available", "A (Great)", 14, "Rental Rack 1-C", "2026-09-28"),
        ("EIM-FLT-SK-0107", "Ski", "Demo", "Winter", "Nordica", "Enforcer 94 Demo", "172 cm", "Marker Squire 11 Demo", "260mm - 380mm", "Available", "A (Great)", 11, "Rental Rack 1-C", "2026-09-27"),
        ("EIM-FLT-SK-0201", "Ski", "Performance", "Winter", "Rossignol", "Experience 86 Basalt", "167 cm", "Look Xpress 11 GW", "260mm - 375mm", "Available", "A (Great)", 25, "Rental Rack 2-A", "2026-09-27"),
        ("EIM-FLT-SK-0202", "Ski", "Performance", "Winter", "Rossignol", "Experience 86 Basalt", "175 cm", "Look Xpress 11 GW", "260mm - 375mm", "Rented", "A (Great)", 31, "With Customer #8423", "2026-09-26"),
        ("EIM-FLT-SK-0301", "Ski", "Standard Sport", "Winter", "Head", "Shape V4 All-Ride", "156 cm", "Head PR 10 Promo GW", "255mm - 378mm", "Available", "B+ (Good)", 38, "Rental Rack 3-A", "2026-09-24"),
        ("EIM-FLT-SK-0302", "Ski", "Standard Sport", "Winter", "Head", "Shape V4 All-Ride", "163 cm", "Head PR 10 Promo GW", "255mm - 378mm", "Available", "B+ (Good)", 42, "Rental Rack 3-A", "2026-09-24"),
        ("EIM-FLT-SK-0303", "Ski", "Standard Sport", "Winter", "Head", "Shape V4 All-Ride", "170 cm", "Head PR 10 Promo GW", "255mm - 378mm", "In Workshop", "B (Edge sharpen)", 40, "Workshop Bench #1", "2026-09-30"),

        # Snowboards in Fleet (Winter)
        ("EIM-FLT-SB-0401", "Snowboard", "Demo", "Winter", "Lib Tech", "T.Rice Pro HP Demo", "157 cm", "Union STR Rental Quick-Adjust", "Adjustable Channel/4x4", "Available", "A+ (Like New)", 8, "Snowboard Bay 4-A", "2026-09-28"),
        ("EIM-FLT-SB-0402", "Snowboard", "Demo", "Winter", "Lib Tech", "Orca Volume Shift", "153 cm", "Burton Cartel Re:Flex Rental", "Adjustable 4x4", "Rented", "A (Great)", 18, "With Customer #8412", "2026-09-26"),
        ("EIM-FLT-SB-0403", "Snowboard", "Demo", "Winter", "Jones", "Mountain Twin Demo", "157 cm", "Union STR Rental Quick-Adjust", "Adjustable 4x4", "Available", "A (Great)", 14, "Snowboard Bay 4-A", "2026-09-27"),
        ("EIM-FLT-SB-0501", "Snowboard", "Standard Sport", "Winter", "Burton", "Ripcord Flat Top", "150 cm", "Burton Progression Disc", "3-Hole / Channel Disc", "Available", "B+ (Good)", 34, "Snowboard Bay 5-A", "2026-09-22"),
        ("EIM-FLT-SB-0502", "Snowboard", "Standard Sport", "Winter", "Burton", "Ripcord Flat Top", "154 cm", "Burton Progression Disc", "3-Hole / Channel Disc", "Reserved", "B+ (Good)", 31, "Staging Shelf Eve Pickup", "2026-09-28"),

        # Backcountry Safety Gear (Winter)
        ("EIM-FLT-AV-0801", "Safety Kit", "Avalanche Gear", "Winter", "BCA", "Tracker3 Kit #1", "One Size", "Digital 3-Antenna Transceiver", "N/A", "Available", "A+ (Tested)", 5, "Backcountry Safe #1", "2026-09-29"),
        ("EIM-FLT-AV-0802", "Safety Kit", "Avalanche Gear", "Winter", "BCA", "Tracker3 Kit #2", "One Size", "Digital 3-Antenna Transceiver", "N/A", "Available", "A+ (Tested)", 8, "Backcountry Safe #1", "2026-09-29"),
        ("EIM-FLT-AV-0803", "Safety Kit", "Avalanche Gear", "Winter", "BCA", "Tracker3 Kit #3", "One Size", "Digital 3-Antenna Transceiver", "N/A", "Rented", "A (Tested)", 12, "With Customer #8430", "2026-09-27"),

        # Mountain Bikes & E-Bikes in Fleet (Summer)
        ("EIM-FLT-BK-0901", "Bicycle", "Enduro MTB", "Summer", "Trek", "Fuel EX 7 Demo", "Medium (29\")", "Shimano Deore 1x12 / Fox Float", "Rider 165-176cm", "Available", "A (Serviced)", 14, "Bike Storage Row 1", "2026-08-25"),
        ("EIM-FLT-BK-0902", "Bicycle", "Enduro MTB", "Summer", "Trek", "Fuel EX 7 Demo", "Large (29\")", "Shimano Deore 1x12 / Fox Float", "Rider 177-188cm", "Available", "A (Serviced)", 19, "Bike Storage Row 1", "2026-08-25"),
        ("EIM-FLT-BK-0903", "Bicycle", "Enduro MTB", "Summer", "Specialized", "Stumpjumper EVO Demo", "S3 (Med-Large)", "SRAM GX 12-spd / Fox 36 Rhythm", "Rider 173-185cm", "Rented", "A+ (Like New)", 8, "With Customer #8911", "2026-08-28"),
        ("EIM-FLT-BK-0904", "Bicycle", "Electric MTB", "Summer", "Specialized", "Turbo Levo E-MTB", "Medium (29\")", "Specialized 2.2 Motor / 700Wh", "Rider 165-178cm", "Available", "A (Charged 100%)", 11, "E-Bike Charge Station", "2026-08-29"),
        ("EIM-FLT-BK-0905", "Bicycle", "Electric MTB", "Summer", "Specialized", "Turbo Levo E-MTB", "Large (29\")", "Specialized 2.2 Motor / 700Wh", "Rider 178-189cm", "In Workshop", "B+ (Brake bleed)", 21, "Bike Workshop Stand #1", "2026-08-30"),
        ("EIM-FLT-BK-0906", "Bicycle", "Valley Cruiser", "Summer", "Giant", "Roam Disc 2", "Medium (700c)", "Shimano 2x9 / Hydraulic Disc", "Rider 165-178cm", "Available", "A (Tuned)", 28, "Bike Storage Row 2", "2026-08-26"),
        ("EIM-FLT-BK-0907", "Bicycle", "Valley Cruiser", "Summer", "Giant", "Roam Disc 2", "Large (700c)", "Shimano 2x9 / Hydraulic Disc", "Rider 177-188cm", "Available", "A (Tuned)", 32, "Bike Storage Row 2", "2026-08-26"),
        ("EIM-FLT-BK-0908", "Bicycle", "Youth MTB", "Summer", "Norco", "Fluid FS 20 Youth", "20\" Wheel", "Youth Air Fork / Hydraulic Disc", "Rider 115-135cm", "Available", "A (Tuned)", 15, "Youth Bike Rack", "2026-08-27"),
    ]

    ws4.append(["Everything in the Mountains — Serialized Rental Fleet Live Tracking System"])
    ws4.append(["Active RFID/Barcode units, status tracking, sizing, sole length, and maintenance log for all seasons."])
    ws4.append([])
    ws4.append(fleet_headers)

    ws4["A1"].font = title_font
    ws4["A2"].font = subtitle_font

    for col_idx in range(1, len(fleet_headers) + 1):
        cell = ws4.cell(row=4, column=col_idx)
        cell.font = header_font
        cell.fill = header_fill
        cell.border = header_border
        cell.alignment = Alignment(horizontal="center" if "Status" in fleet_headers[col_idx-1] or "Days" in fleet_headers[col_idx-1] or "Date" in fleet_headers[col_idx-1] or "Season" in fleet_headers[col_idx-1] else "left", vertical="center")

    for row_idx, data_row in enumerate(fleet_data, start=5):
        ws4.append(list(data_row))
        curr_fill = zebra_fill if (row_idx % 2 == 0) else white_fill

        for col_idx in range(1, len(data_row) + 1):
            c = ws4.cell(row=row_idx, column=col_idx)
            c.font = regular_font
            c.fill = curr_fill
            c.border = border_thin

            val = c.value
            header_name = fleet_headers[col_idx - 1]

            if header_name == "Fleet Barcode":
                c.font = code_font
            elif header_name == "Season":
                c.alignment = Alignment(horizontal="center")
                c.font = bold_font
            elif header_name == "Cumulative Days Rented":
                c.number_format = int_format
                c.alignment = Alignment(horizontal="center")
            elif header_name == "Current Status":
                c.alignment = Alignment(horizontal="center")
                if val == "Available":
                    c.fill = in_stock_fill
                    c.font = in_stock_font
                elif val == "Rented":
                    c.fill = rented_fill
                    c.font = rented_font
                elif val == "In Workshop":
                    c.fill = low_stock_fill
                    c.font = low_stock_font
                elif val == "Reserved":
                    c.fill = highlight_fill
                    c.font = bold_font
            elif "Date" in header_name:
                c.alignment = Alignment(horizontal="center")

    ws4.freeze_panes = "A5"

    # =========================================================================
    # TAB 5: Workshop_Services_Menu
    # =========================================================================
    ws5 = wb.create_sheet(title="Workshop_Services_Menu")
    ws5.views.sheetView[0].showGridLines = True

    workshop_headers = [
        "Service Code", "Service Name", "Season", "Price (CAD)", "Standard Turnaround",
        "Rush Option Available", "Drop-Off Cutoff Time", "Applicable Equipment",
        "Technical Process & Inclusions", "Guarantee & Safety Policy"
    ]

    workshop_data = [
        # Ski & Board Tuning Services (Winter)
        ("WRK-TUNE-FULL", "Full Montana Precision Overhaul Tune", "Winter", 65.00, "Overnight (Ready 8:00 AM)", "Yes (Rush 2-Hour +$25)", "5:00 PM", "Skis & Snowboards", "Montana Saphir robot stone grind structure (linear/cross hatch), ceramic disk edge finish (0.75° base / 2° side), minor P-Tex fill, IR wax.", "Matches website ($65 CAD). Restores glide speed and silky turn initiation. 100% satisfaction guaranteed."),
        ("WRK-TUNE-BASIC", "Standard Edge Sharpen & Hand Wax", "Winter", 45.00, "Overnight (Ready 8:00 AM)", "Yes (2 Hours +$25)", "5:00 PM", "Skis & Snowboards", "Machine ceramic edge sharpening, hand iron hot wax, scraped and horsehair brushed for maximum glide.", "Matches website ($45 CAD). Restores sharp edge grip on cold hardpack and morning snow."),
        ("WRK-WAX-STD", "15-Minute Counter Hot Wax & Buff", "Winter", 25.00, "Same Day (15 Minutes)", "Standard Walk-In Service", "5:30 PM", "Skis & Snowboards", "Infrared thermal wax iron application, scrape, rotary nylon & horsehair brush polish done while you wait.", "Matches website ($25 CAD). Ready before morning coffee finishes brewing."),
        ("WRK-WAX-IR", "Infrared Deep Wax Penetration", "Winter", 40.00, "Overnight (Ready 8:00 AM)", "Yes (2 Hours +$20)", "5:00 PM", "Skis & Snowboards", "Waxelator infrared heating lamp drives micro-crystalline wax deep into base pores without contact heat shock.", "Lasts 3x longer than traditional hand wax. Ideal for dry Okanagan cold smoke powder."),
        ("WRK-TUNE-RACE", "World Cup Hand Prep & Race Tune", "Winter", 115.00, "24 to 48 Hours", "No (Precision hand work)", "5:00 PM", "Race & High-Performance Skis", "Precision base flattening, custom laser structure pattern, hand-filed 0.5°/3° bevels, gummy stone polish, double cold IR wax cycle.", "Performed by Master Bootfitter/Technician. Requires 24-hr base curing."),
        ("WRK-MOUNT-STD", "Ski / Snowboard Binding Mount & DIN Test", "Winter", 60.00, "Same Day or Next Morning", "Yes (2 Hours +$25)", "5:00 PM", "Alpine Skis & Snowboards", "Professional jig drilling, waterproof resin mounting, DIN torque calibration on computerized Montana tester.", "COMPLIMENTARY with purchase of new skis/board and bindings at our shop."),
        ("WRK-REMOUNT", "Binding Remount & Core Hole Plug", "Winter", 75.00, "Overnight (Ready 8:00 AM)", "Yes (Rush 3 Hours +$30)", "5:00 PM", "Alpine Skis", "Remove old bindings, tap and insert color-matched watertight nylon plugs, drill new pattern, DIN safety certification.", "Requires minimum 15mm clearance from previous binding hole pattern."),
        ("WRK-CORE-REPAIR", "Core Shot & Base Delamination Epoxy Repair", "Winter", 45.00, "24 Hours (Curing required)", "No (Epoxy cure time 12h)", "3:00 PM", "Skis & Snowboards", "Base excision, marine structural epoxy metal-grip bond, P-Tex weld patch, stone leveled to flush finish.", "Priced at $45 base plus $15 per additional inch of damage beyond 2 inches."),
        ("WRK-BOOT-PUNCH", "Custom Boot Shell Punch / Stretch (Per Zone)", "Winter", 35.00, "Same Day (Approx 1-2 Hours)", "N/A (By Appointment)", "4:00 PM", "Ski & Snowboard Boots", "Infrared localized heating of boot shell, hydraulic ball/ring press to relieve 6th-toe, navicular, or ankle pressure.", "Includes 14-Day Custom Boot Comfort Guarantee. Free adjustments if work done on boots purchased in-store."),
        ("WRK-BOOT-INSOLE", "Sidas Custom Molded Footbeds / Orthotics", "All year", 145.00, "45-Minute In-Store Session", "Walk-ins or Booked Slot", "5:00 PM", "Any Ski/Snowboard/Bike Boots", "Heated vacuum casting pod molds 100% bespoke high-density arch support under guest feet. Prevents foot collapse.", "Guarantees reduced foot fatigue, improved heel lock, and 20% sharper edge control response."),
        ("WRK-RUSH-FEE", "Priority Express Rush Tune Surcharge", "All year", 25.00, "Guaranteed 2 Hours", "Standard Offering", "3:30 PM", "Any Tune or Wax", "Jumps the queue ahead of overnight production queue. Dedicated master tech allocated immediately.", "Subject to workshop machine availability during peak holidays."),

        # Summer Bike Workshop Services
        ("WRK-BIK-TUNE-PRO", "Comprehensive Mountain Bike Overhaul & Tune", "Summer", 85.00, "Overnight (Ready 8:00 AM)", "Yes (Rush 3-Hour +$25)", "5:00 PM", "Mountain & Trail Bikes", "Full drivetrain ultrasonic degrease and lube, shifting calibration, wheel truing, headset adjustment, rotor deglazing, safety bolt torque check.", "Ensures crisp shifting and quiet mountain trail operation. Certified mechanics."),
        ("WRK-BIK-TUNE-BASIC", "Basic Bike Safety Check, Shift & Brake Tune", "Summer", 45.00, "Same Day (3 Hours)", "Yes (1-Hour +$15)", "4:00 PM", "All Bicycles", "Brakes inspected and centered, cables adjusted, chain wiped and lubed, tires inflated to optimal terrain pressure.", "Recommended tune-up before weekend trail rides or valley cruises."),
        ("WRK-BIK-BLEED", "Hydraulic Disc Brake Bleed (Per Brake)", "Summer", 35.00, "Same Day (2 Hours)", "Yes (1-Hour +$15)", "4:30 PM", "Mountain & Gravel Bikes", "Complete fluid replacement with fresh Shimano Mineral Oil or SRAM DOT fluid, air bubbles expelled, caliper piston reset.", "Restores firm lever feel and full stopping power on steep alpine descents."),
        ("WRK-BIK-TUBELESS", "Tubeless Tire Setup & Sealant Refresh (Per Wheel)", "Summer", 30.00, "Same Day (1-2 Hours)", "Yes (45-Min +$15)", "5:00 PM", "Mountain & Gravel Bikes", "Stan's NoTubes sealant injection, rim tape inspection, valve core clean/replace, high-pressure bead seating.", "Prevents trail pinch flats and thorn punctures. Guaranteed airtight seal.")
    ]

    ws5.append(["Everything in the Mountains — Full-Service Certified Tuning Workshop & Tech Center"])
    ws5.append(["Overnight drop-off by 5:00 PM ready 8:00 AM next morning. Certified technicians on duty for Winter and Summer gear. All prices CAD."])
    ws5.append([])
    ws5.append(workshop_headers)

    ws5["A1"].font = title_font
    ws5["A2"].font = subtitle_font

    for col_idx in range(1, len(workshop_headers) + 1):
        cell = ws5.cell(row=4, column=col_idx)
        cell.font = header_font
        cell.fill = header_fill
        cell.border = header_border
        cell.alignment = Alignment(horizontal="center" if "Price" in workshop_headers[col_idx-1] or "Time" in workshop_headers[col_idx-1] or "Cutoff" in workshop_headers[col_idx-1] or "Season" in workshop_headers[col_idx-1] else "left", vertical="center")

    for row_idx, data_row in enumerate(workshop_data, start=5):
        ws5.append(list(data_row))
        curr_fill = zebra_fill if (row_idx % 2 == 0) else white_fill

        for col_idx in range(1, len(data_row) + 1):
            c = ws5.cell(row=row_idx, column=col_idx)
            c.font = regular_font
            c.fill = curr_fill
            c.border = border_thin

            val = c.value
            header_name = workshop_headers[col_idx - 1]

            if "Price" in header_name:
                c.number_format = currency_format
                c.alignment = Alignment(horizontal="right")
            elif header_name == "Service Code":
                c.font = code_font
            elif header_name == "Season":
                c.alignment = Alignment(horizontal="center")
                c.font = bold_font
            elif "Cutoff" in header_name or "Time" in header_name:
                c.alignment = Alignment(horizontal="center")

    ws5.freeze_panes = "A5"

    # =========================================================================
    # TAB 6: Tours_and_Experiences
    # =========================================================================
    ws6 = wb.create_sheet(title="Tours_and_Experiences")
    ws6.views.sheetView[0].showGridLines = True

    tour_headers = [
        "Tour Code", "Experience Name", "Season", "Operating Dates", "Price (CAD)",
        "Pricing Basis", "Duration", "Min Age", "Group Limits",
        "Cold Weather & Weather Policy", "Escalation / Handoff Trigger", "Gear & Inclusions"
    ]

    tour_data = [
        # Winter Tours
        ("EXP-BC-CAT", "Monashee Powder Cat-Skiing Full Day", "Winter", "Dec 15 - Apr 10", 725.00, "Per Person", "8:00 AM - 4:30 PM (Full Day)", 16, "Min 6, Max 12 guests per cat", "Tours run down to -25°C. If extreme avalanche danger or mountain closure occurs, 100% refund or free reschedule.", "Groups of 10+ must be transferred to Mountain Operations Manager. Custom dates require manager review.", "ACMG certified lead & tail guides, BCA Float 32 airbag, Tracker4 beacon, probe, shovel, hot cat lunch & aprés."),
        ("EXP-SNW-RIDGE", "Okanagan Ridge Guided Snowmobile Tour", "Winter", "Dec 01 - Apr 15", 265.00, "Per Driver (+$95 Passenger)", "3.5 Hours (Morning / Afternoon)", 12, "Min 2, Max 8 machines per guide", "Runs down to -25°C. Heated handlebars, FXR thermal suits and dual-pane modular helmets provided free.", "Private corporate group bookings (6+ sleds) require direct manager confirmation.", "2026 Ski-Doo Summit 850 E-TEC, trail permits, hot cider/cocoa warming hut stop, fuel & insurance."),
        ("EXP-FND-NIGHT", "Starlight Snowshoe & Alpine Fondue Tour", "Winter", "Dec 20 - Mar 30", 115.00, "Per Person", "2.5 Hours (Depart 6:00 PM)", 8, "Min 4, Max 20 guests", "Tours run down to -25°C. In heavy blizzard, route moves to sheltered cedar grove.", "Groups of 10 or more or custom catering requests must be passed to management. Bot cannot discount.", "Tubbs snowshoes, trekking poles, high-power LED headlamps, local Swiss-style three-cheese fondue & Okanagan wine."),
        ("EXP-AST-LVL1", "Avalanche Canada AST-1 Field Course & Cert", "Winter", "Jan 05 - Mar 25", 395.00, "Per Student", "2 Full Days (Class + Mountain Field)", 16, "Max 8 students per instructor", "Field day goes in all winter conditions unless road access closed by BC Ministry of Transportation.", "Bot must NEVER provide personalized safety clearance or avalanche route assessment. Safety escalation.", "Avalanche Canada AST-1 certification certificate, decision-making framework card, companion rescue drill."),

        # Summer & Shoulder Tours
        ("EXP-LAK-CRUISE", "Okanagan Lake Private Sunset Charter", "Summer", "May 15 - Sep 30", 1250.00, "Private Yacht (Up to 10 guests)", "4 Hours (Depart 4:30 PM)", 0, "Max 10 passengers strictly", "If Air Quality Health Index (AQHI) reaches 7+ or severe wind storm occurs, cancel/reschedule at guest discretion with 100% credit.", "Corporate dinner, private chef, or wedding parties MUST be escalated to manager.", "34-ft Sunseeker sport yacht, licensed skipper, fuel, Okanagan charcuterie board, chilled local wines, water sports SUPs."),
        ("EXP-MTB-WINE", "Okanagan Rail Trail E-Bike Winery Discovery", "Summer", "May 01 - Oct 20", 185.00, "Per Person", "4.5 Hours (10:00 AM - 2:30 PM)", 19, "Min 2, Max 10 riders", "If AQHI >= 7 or heavy rain, free reschedule. Layers recommended for lake breeze.", "Private buyouts or custom winery selection over 8 guests require manager quote.", "Specialized Turbo Vado E-Bike, helmet, pannier, tastings at 3 partner lakeside wineries, gourmet lunch box."),
        ("EXP-MTB-GUIDE", "Guided Alpine Singletrack Enduro MTB Tour", "Summer", "Jun 15 - Sep 30", 165.00, "Per Rider", "4 Hours (Morning / Afternoon)", 14, "Min 2, Max 6 riders per guide", "Runs in light rain; severe lightning or AQHI >= 7 triggers free reschedule or full credit.", "Private custom groups of 6+ or technical downhill coaching require manager booking.", "PMBIA certified guide, shuttle van access to alpine trailhead, trail pass, spare tubes and pump support."),
        ("EXP-OKN-FALL", "Okanagan Valley Fall Colors & Ridge Photography Hike", "Shoulder / Fall", "Sep 15 - Nov 10", 95.00, "Per Person", "3 Hours (Depart 9:30 AM)", 8, "Min 4, Max 14 guests", "Runs in all autumn weather except high gale winds. Warm layers and sturdy footwear recommended.", "Groups of 10+ or special photo workshop requests require manager booking.", "Certified naturalist guide, carbon trekking poles, local orchard hot apple cider and fresh artisanal pastries.")
    ]

    ws6.append(["Everything in the Mountains — Guided Mountain Expeditions & Outdoor Experiences"])
    ws6.append(["Official rates, safety standards, cold-weather operating rules (-25°C), AQHI smoke policies, and policy thresholds. All prices CAD."])
    ws6.append([])
    ws6.append(tour_headers)

    ws6["A1"].font = title_font
    ws6["A2"].font = subtitle_font

    for col_idx in range(1, len(tour_headers) + 1):
        cell = ws6.cell(row=4, column=col_idx)
        cell.font = header_font
        cell.fill = header_fill
        cell.border = header_border
        cell.alignment = Alignment(horizontal="center" if "Price" in tour_headers[col_idx-1] or "Duration" in tour_headers[col_idx-1] or "Age" in tour_headers[col_idx-1] or "Season" in tour_headers[col_idx-1] else "left", vertical="center")

    for row_idx, data_row in enumerate(tour_data, start=5):
        ws6.append(list(data_row))
        curr_fill = zebra_fill if (row_idx % 2 == 0) else white_fill

        for col_idx in range(1, len(data_row) + 1):
            c = ws6.cell(row=row_idx, column=col_idx)
            c.font = regular_font
            c.fill = curr_fill
            c.border = border_thin

            val = c.value
            header_name = tour_headers[col_idx - 1]

            if "Price" in header_name:
                c.number_format = currency_format
                c.alignment = Alignment(horizontal="right")
            elif header_name == "Tour Code":
                c.font = code_font
            elif header_name == "Season":
                c.alignment = Alignment(horizontal="center")
                c.font = bold_font
            elif "Age" in header_name or "Min" in header_name:
                c.alignment = Alignment(horizontal="center")

    ws6.freeze_panes = "A5"

    # =========================================================================
    # TAB 7: Bot_Rules_and_Policies
    # =========================================================================
    ws7 = wb.create_sheet(title="Bot_Rules_and_Policies")
    ws7.views.sheetView[0].showGridLines = True

    policy_headers = [
        "Rule ID", "Category / Topic", "Customer Trigger / Keywords",
        "Approved Business Rule / Fact", "Bot Allowed Action", "Mandatory Action / Response Pattern"
    ]

    policy_data = [
        ("POL-HOURS", "Store Hours", "hours, open, close, stat holidays, what time", "Everything in the Mountains is open 8:00 AM to 6:00 PM every day in season, stat holidays included.", "Direct Answer", "Quote exact operating hours: 8:00 AM - 6:00 PM daily."),
        ("POL-PHONE", "Contact Number", "phone, call, telephone, speak to someone", "Store phone line is SECOND NUMBER (not yet set up). Staffed during regular store hours.", "Direct Answer", "State that phone line is SECOND NUMBER (not yet set up)."),
        ("POL-LOC", "Store Location", "where are you, address, location, find shop", "Everything in the Mountains is located at Village Slopeside & West Alley in the Okanagan, BC resort gateway.", "Direct Answer", "State Village Slopeside & West Alley location and directions."),
        ("POL-TUNE-DROP", "Workshop Cutoff", "drop off, tune cutoff, ready morning, rush tune", "Standard drop-off cutoff is 5:00 PM for 8:00 AM next-morning pickup. 2-hour rush service available for +$25.", "Direct Answer", "Explain 5:00 PM drop-off for 8:00 AM next morning, or 2-hour rush option (+$25)."),
        ("POL-RNT-PICKUP", "Rental Early Pickup", "early pickup, night before, pick up evening", "Complimentary early pickup is available between 4:00 PM and 6:30 PM the evening before rental day so guests can head straight to first chair or trails.", "Direct Answer", "Highlight free 4:00 PM - 6:30 PM night-before pickup window."),
        ("POL-LATE-LOCKER", "After-Hours Locker", "late arrival, after hours, locker code, 4482", "For arrivals after 6:00 PM, pre-booked gear is staged in our heated West Entrance locker. The keypad code is 4482.", "Direct Answer", "Quote after-hours heated locker access at West Entrance using keypad code 4482."),
        ("POL-RNT-BASE", "Rental Starting Rate", "cheapest rental, starting price, daily rate", "Recreational sport ski and snowboard rentals start at $52 per day.", "Direct Answer", "Quote $52 per day starting rate from official rate card."),
        ("POL-RNT-DEMO", "Demo Ski Pricing", "demo skis, performance skis, rustler, armada", "High-performance demo skis are $75 per day.", "Direct Answer", "Quote $75 per day demo ski package rate."),
        ("POL-RNT-SPLIT", "Splitboard Pricing", "splitboard, backcountry board, touring setup", "Backcountry splitboard packages are $85 per day.", "Direct Answer", "Quote $85 per day backcountry splitboard package rate."),
        ("POL-RNT-JR", "Junior Package Pricing", "kids skis, junior rental, children equipment", "Junior complete ski and snowboard packages (ages 12 & under) are $32 per day.", "Direct Answer", "Quote $32 per day junior package rate."),
        ("POL-RNT-AVALANCHE", "Avalanche Kit Rental", "beacon, probe, shovel, avalanche kit, tracker", "BCA Tracker3 avalanche safety kits (transceiver, 270cm probe, shovel) are $35 per day.", "Direct Answer", "Quote $35 per day BCA Tracker3 safety kit rate."),
        ("POL-TUNE-RATES", "Tuning Menu Pricing", "tune cost, edge sharpen, wax price, overhaul", "Full precision overhaul tune is $65 CAD, standard edge & wax is $45 CAD, and 15-minute counter wax is $25 CAD.", "Direct Answer", "Quote official workshop rates: $65 full overhaul / $45 edge & wax / $25 counter wax."),
        ("POL-COLD-CUT", "Weather & Temperature", "cold weather, freezing, cancel cold, -25", "Tours run down to -25°C with heated gear supplied. If weather closes mountain trails, guests receive free reschedule or 100% refund.", "Direct Answer", "Quote -25°C operating limit and refund/reschedule policy."),
        ("POL-AIR-QUAL", "Air Quality Policy", "smoke, fire smoke, AQHI, air quality", "If Air Quality Health Index (AQHI) reaches 7 or higher, outdoor tours can be rescheduled or cancelled with full credit at guest discretion.", "Direct Answer", "Quote AQHI 7+ safety credit policy."),
        ("POL-WAIVER", "Digital Waivers & Minors", "waiver, kids under 19, minor consent, age of majority", "All guests under 19 in British Columbia require a parent or legal guardian signature on the online digital waiver prior to departure.", "Direct Answer", "Explain mandatory parent/guardian signature for minors under 19."),
        ("POL-CANCEL", "Cancellation Terms", "cancel, change date, refund policy, penalty", "Cancel or change up to 48 hours prior to departure for a full 100% refund with zero penalty fees.", "Direct Answer", "Explain 48-hour 100% money-back policy with no penalty fees."),
        ("ESC-GRP-10PLUS", "Large Group Escalation", "group, 10 people, corporate booking, wedding, private trip", "Groups of 10 or more must be passed to our store manager. The bot must NOT quote custom group discounts or confirm bookings directly.", "HAND_OFF_TO_STAFF", "Groups of 10 or more are arranged directly by our store manager. What is the best phone number or email to reach you?"),
        ("ESC-CATERING", "Custom Catering Escalation", "catering, private chef, custom package, dinner", "Custom packages and catering requests must be escalated to human staff. Bot cannot quote food/beverage buyouts.", "HAND_OFF_TO_STAFF", "Custom packages and catering are handled directly by our team. I will pass your details to our manager—what's the best number to reach you?"),
        ("ESC-MEDICAL", "Medical / Avalanche Advice", "injury, pregnant, heart condition, avalanche safe, is it safe today", "Bot must never provide medical advice or personalized backcountry avalanche safety clearance.", "HAND_OFF_TO_STAFF", "For safety and medical considerations, please speak directly with our certified guides and safety coordinators."),
        ("REF-WEATHER-FC", "Meteorological Forecasts", "will it snow tomorrow, powder forecast, how many cm", "Bot must NOT guess weather or snow forecasts not contained in approved data. It must state it does not have live forecasts.", "REFUSE_GUESSING", "I don't have weather forecasts in our verified information, so I won't guess. Please check the mountain snow report."),
        ("REF-DISCOUNT", "Unauthorized Discounts", "give me discount, coupon code, cheaper price, 20% off", "Bot must NEVER invent discounts, promo codes, or unlisted rates. Stick strictly to published rates.", "REFUSE_DISCOUNT", "We don't have discounts or promotional codes beyond our verified published rates."),
    ]

    ws7.append(["Everything in the Mountains — Bot Guardrail Rules, Knowledge Base & Escalation Matrix"])
    ws7.append(["Standard operating procedures for showcase concierge and Jev Bot verification. Typed pass/escalate boundaries."])
    ws7.append([])
    ws7.append(policy_headers)

    ws7["A1"].font = title_font
    ws7["A2"].font = subtitle_font

    for col_idx in range(1, len(policy_headers) + 1):
        cell = ws7.cell(row=4, column=col_idx)
        cell.font = header_font
        cell.fill = header_fill
        cell.border = header_border
        cell.alignment = Alignment(horizontal="center" if "ID" in policy_headers[col_idx-1] or "Action" in policy_headers[col_idx-1] else "left", vertical="center")

    for row_idx, data_row in enumerate(policy_data, start=5):
        ws7.append(list(data_row))
        curr_fill = zebra_fill if (row_idx % 2 == 0) else white_fill

        for col_idx in range(1, len(data_row) + 1):
            c = ws7.cell(row=row_idx, column=col_idx)
            c.font = regular_font
            c.fill = curr_fill
            c.border = border_thin

            val = c.value
            header_name = policy_headers[col_idx - 1]

            if header_name == "Rule ID":
                c.font = code_font
            elif header_name == "Bot Allowed Action":
                c.alignment = Alignment(horizontal="center")
                if val == "Direct Answer":
                    c.fill = in_stock_fill
                    c.font = in_stock_font
                elif val == "HAND_OFF_TO_STAFF":
                    c.fill = low_stock_fill
                    c.font = low_stock_font
                elif "REFUSE" in val:
                    c.fill = out_stock_fill
                    c.font = out_stock_font

    ws7.freeze_panes = "A5"

    # =========================================================================
    # TAB 8: Sales_Log (Simple realistic multi-season shop transaction log)
    # =========================================================================
    ws8 = wb.create_sheet(title="Sales_Log")
    ws8.views.sheetView[0].showGridLines = True

    sales_headers = [
        "Transaction ID", "Date", "Season", "Department", "Item Code / SKU",
        "Item Description", "Qty", "Unit Price (CAD)", "Line Total (CAD)",
        "Payment Method", "Customer Type"
    ]

    sales_data = [
        # Winter Sales Transactions (32 rows)
        ("TXN-2026-0101", "2026-01-05", "Winter", "Rentals", "RNT-DEMO-SKI", "Demo Ski Package 1-Day Rental", 1, 75.00, 75.00, "Credit Card", "Resort Guest"),
        ("TXN-2026-0102", "2026-01-05", "Winter", "Workshop", "WRK-TUNE-BASIC", "Standard Edge Sharpen & Hand Wax", 1, 45.00, 45.00, "Debit Card", "Local Resident"),
        ("TXN-2026-0103", "2026-01-06", "Winter", "Rentals", "RNT-REC-SKI", "Standard Recreational Ski Package 2-Day", 2, 96.00, 192.00, "Credit Card", "Resort Guest"),
        ("TXN-2026-0104", "2026-01-07", "Winter", "Workshop", "WRK-TUNE-FULL", "Full Precision Overhaul Tune", 1, 65.00, 65.00, "Credit Card", "Local Resident"),
        ("TXN-2026-0105", "2026-01-08", "Winter", "Retail Softgoods", "SOX-DAR-SKI1-L", "Darn Tough RFL OTC Ski Socks", 2, 34.00, 68.00, "Apple Pay", "Resort Guest"),
        ("TXN-2026-0106", "2026-01-10", "Winter", "Rentals", "RNT-TOURING", "Alpine Touring Splitboard Package", 1, 85.00, 85.00, "Credit Card", "Backcountry Tourer"),
        ("TXN-2026-0107", "2026-01-10", "Winter", "Rentals", "RNT-AVALANCHE", "BCA Tracker3 Avalanche Kit Rental", 1, 35.00, 35.00, "Credit Card", "Backcountry Tourer"),
        ("TXN-2026-0108", "2026-01-12", "Winter", "Workshop", "WRK-WAX-STD", "15-Minute Counter Hot Wax", 2, 25.00, 50.00, "Debit Card", "Resort Guest"),
        ("TXN-2026-0109", "2026-01-14", "Winter", "Tours", "EXP-FND-NIGHT", "Starlight Snowshoe Fondue Tour", 2, 115.00, 230.00, "Credit Card", "Resort Guest"),
        ("TXN-2026-0110", "2026-01-15", "Winter", "Rentals", "RNT-JR-SKI", "Junior Complete Ski Package 3-Day", 1, 82.00, 82.00, "Credit Card", "Family Vacationer"),
        ("TXN-2026-0111", "2026-01-17", "Winter", "Retail Hardgoods", "SKI-SAL-QST98-176", "Salomon QST 98 Skis 176cm", 1, 799.99, 799.99, "Credit Card", "Local Resident"),
        ("TXN-2026-0112", "2026-01-17", "Winter", "Workshop", "WRK-MOUNT-STD", "Binding Mount & DIN Test (Complimentary with Ski)", 1, 0.00, 0.00, "Store Comp", "Local Resident"),
        ("TXN-2026-0113", "2026-01-19", "Winter", "Rentals", "RNT-DEMO-SNB", "Demo Snowboard Package 1-Day", 1, 78.00, 78.00, "Credit Card", "Resort Guest"),
        ("TXN-2026-0114", "2026-01-20", "Winter", "Workshop", "WRK-RUSH-FEE", "Priority Express Rush Tune Surcharge", 1, 25.00, 25.00, "Credit Card", "Resort Guest"),
        ("TXN-2026-0115", "2026-01-22", "Winter", "Retail Softgoods", "GLV-HES-ARMY-09", "Hestra Army Leather Heli Ski 3-Finger", 1, 195.00, 195.00, "Credit Card", "Resort Guest"),
        ("TXN-2026-0116", "2026-01-24", "Winter", "Tours", "EXP-SNW-RIDGE", "Okanagan Ridge Guided Snowmobile Tour", 1, 265.00, 265.00, "Credit Card", "Resort Guest"),
        ("TXN-2026-0117", "2026-01-27", "Winter", "Rentals", "RNT-SNOWSHOE", "Tubbs Trail Snowshoe Package 1-Day", 2, 24.00, 48.00, "Debit Card", "Local Resident"),
        ("TXN-2026-0118", "2026-01-30", "Winter", "Workshop", "WRK-TUNE-FULL", "Full Precision Overhaul Tune", 1, 65.00, 65.00, "Credit Card", "Local Resident"),
        ("TXN-2026-02-02", "2026-02-02", "Winter", "Rentals", "RNT-REC-SKI", "Standard Recreational Ski Package 1-Day", 1, 52.00, 52.00, "Credit Card", "Resort Guest"),
        ("TXN-2026-02-04", "2026-02-04", "Winter", "Workshop", "WRK-BOOT-PUNCH", "Custom Boot Shell Punch (6th Toe Relief)", 1, 35.00, 35.00, "Credit Card", "Local Resident"),
        ("TXN-2026-02-07", "2026-02-07", "Winter", "Rentals", "RNT-DEMO-SKI", "Demo Ski Package 3-Day Rental", 1, 195.00, 195.00, "Credit Card", "Resort Guest"),
        ("TXN-2026-02-10", "2026-02-10", "Winter", "Tours", "EXP-BC-CAT", "Monashee Powder Cat-Skiing Full Day", 1, 725.00, 725.00, "Credit Card", "Advanced Skier"),
        ("TXN-2026-02-12", "2026-02-12", "Winter", "Workshop", "WRK-WAX-STD", "15-Minute Counter Hot Wax", 1, 25.00, 25.00, "Debit Card", "Resort Guest"),
        ("TXN-2026-02-14", "2026-02-14", "Winter", "Retail Softgoods", "GOG-OAK-FLTL-SAP", "Oakley Flight Deck L Goggles", 1, 285.00, 285.00, "Credit Card", "Resort Guest"),
        ("TXN-2026-02-17", "2026-02-17", "Winter", "Rentals", "RNT-HELMET", "Smith MIPS Helmet Rental 2-Day", 2, 22.00, 44.00, "Debit Card", "Resort Guest"),
        ("TXN-2026-02-20", "2026-02-20", "Winter", "Workshop", "WRK-TUNE-BASIC", "Standard Edge Sharpen & Hand Wax", 1, 45.00, 45.00, "Credit Card", "Local Resident"),
        ("TXN-2026-02-22", "2026-02-22", "Winter", "Rentals", "RNT-JR-SNB", "Junior Grom Snowboard Package 1-Day", 1, 32.00, 32.00, "Credit Card", "Family Vacationer"),
        ("TXN-2026-02-25", "2026-02-25", "Winter", "Retail Hardgoods", "SBD-BUR-CUSC-156", "Burton Custom Camber Snowboard", 1, 749.99, 749.99, "Credit Card", "Resort Guest"),
        ("TXN-2026-02-28", "2026-02-28", "Winter", "Rentals", "RNT-BOOT-ONLY", "Ski Boot-Only Rental 1-Day", 1, 28.00, 28.00, "Debit Card", "Resort Guest"),
        ("TXN-2026-03-05", "2026-03-05", "Winter", "Workshop", "WRK-TUNE-FULL", "Full Precision Overhaul Tune", 1, 65.00, 65.00, "Credit Card", "Local Resident"),
        ("TXN-2026-03-12", "2026-03-12", "Winter", "Rentals", "RNT-DEMO-SKI", "Demo Ski Package 1-Day Rental", 2, 75.00, 150.00, "Credit Card", "Resort Guest"),
        ("TXN-2026-03-20", "2026-03-20", "Winter", "Rentals", "RNT-XC-NORDIC", "Nordic Cross-Country Classic Track Package", 2, 35.00, 70.00, "Debit Card", "Local Resident"),

        # Summer Sales Transactions (30 rows)
        ("TXN-2026-0501", "2026-05-12", "Summer", "Workshop", "WRK-BIK-TUNE-PRO", "Comprehensive Mountain Bike Overhaul", 1, 85.00, 85.00, "Credit Card", "Local Cyclist"),
        ("TXN-2026-0502", "2026-05-15", "Summer", "Rentals", "RNT-MTB-ENDURO", "Full Suspension Enduro MTB 1-Day Rental", 1, 85.00, 85.00, "Credit Card", "Resort Visitor"),
        ("TXN-2026-0503", "2026-05-16", "Summer", "Rentals", "RNT-BIKE-EMTB", "Specialized Turbo Levo E-MTB 1-Day", 2, 115.00, 230.00, "Credit Card", "Resort Visitor"),
        ("TXN-2026-0504", "2026-05-18", "Summer", "Tours", "EXP-MTB-WINE", "Okanagan Rail Trail E-Bike Winery Discovery", 2, 185.00, 370.00, "Credit Card", "Wine Tourist"),
        ("TXN-2026-0505", "2026-05-21", "Summer", "Workshop", "WRK-BIK-TUBELESS", "Tubeless Tire Setup & Sealant Refresh", 2, 30.00, 60.00, "Debit Card", "Local Cyclist"),
        ("TXN-2026-0506", "2026-05-24", "Summer", "Retail Softgoods", "APP-FOX-DEFF-M-BK", "Fox Racing Defend Kevlar MTB Pants", 1, 179.95, 179.95, "Credit Card", "Mountain Biker"),
        ("TXN-2026-0507", "2026-05-28", "Summer", "Rentals", "RNT-BIKE-VALLEY", "Valley Pathway Cruiser 1-Day Rental", 2, 45.00, 90.00, "Apple Pay", "Sightseeing Guest"),
        ("TXN-2026-0601", "2026-06-02", "Summer", "Workshop", "WRK-BIK-BLEED", "Hydraulic Disc Brake Bleed (Both)", 2, 35.00, 70.00, "Debit Card", "Local Cyclist"),
        ("TXN-2026-0602", "2026-06-05", "Summer", "Rentals", "RNT-MTB-ENDURO", "Full Suspension Enduro MTB 2-Day Rental", 1, 155.00, 155.00, "Credit Card", "Resort Visitor"),
        ("TXN-2026-0603", "2026-06-08", "Summer", "Retail Softgoods", "APP-PAT-SUNH-M-GY", "Patagonia Capilene Cool Sun Hoody", 1, 79.00, 79.00, "Credit Card", "Trail Hiker"),
        ("TXN-2026-0604", "2026-06-12", "Summer", "Tours", "EXP-LAK-CRUISE", "Okanagan Lake Private Sunset Charter", 1, 1250.00, 1250.00, "Credit Card", "Private Event"),
        ("TXN-2026-0605", "2026-06-15", "Summer", "Rentals", "RNT-BIKE-JR", "Junior Mountain Bike 1-Day Rental", 1, 32.00, 32.00, "Debit Card", "Family Tourist"),
        ("TXN-2026-0606", "2026-06-18", "Summer", "Workshop", "WRK-BIK-TUNE-BASIC", "Basic Bike Safety Check & Lube", 1, 45.00, 45.00, "Credit Card", "Local Resident"),
        ("TXN-2026-0607", "2026-06-20", "Summer", "Retail Hardgoods", "BIK-GIA-ROAM-L", "Giant Roam Disc 2 Cruiser Bike", 1, 879.99, 879.99, "Credit Card", "Local Resident"),
        ("TXN-2026-0608", "2026-06-22", "Summer", "Rentals", "RNT-BIKE-PADS", "Downhill Bike Pad Protection Set", 1, 15.00, 15.00, "Apple Pay", "Bike Park Rider"),
        ("TXN-2026-0609", "2026-06-25", "Summer", "Tours", "EXP-MTB-GUIDE", "Guided Alpine Singletrack Enduro MTB Tour", 2, 165.00, 330.00, "Credit Card", "Visiting Enduro Rider"),
        ("TXN-2026-0610", "2026-06-28", "Summer", "Retail Softgoods", "GLV-FOX-RANG-09", "Fox Racing Ranger Mountain Bike Gloves", 1, 39.95, 39.95, "Debit Card", "Local Mountain Biker"),
        ("TXN-2026-0701", "2026-07-02", "Summer", "Rentals", "RNT-BIKE-EMTB", "Specialized Turbo Levo E-MTB 3-Day", 1, 295.00, 295.00, "Credit Card", "Resort Guest"),
        ("TXN-2026-0702", "2026-07-06", "Summer", "Workshop", "WRK-BIK-TUNE-PRO", "Comprehensive Mountain Bike Overhaul", 1, 85.00, 85.00, "Credit Card", "Local Cyclist"),
        ("TXN-2026-0703", "2026-07-10", "Summer", "Tours", "EXP-MTB-WINE", "Okanagan Rail Trail E-Bike Winery Discovery", 4, 185.00, 740.00, "Credit Card", "Tour Group"),
        ("TXN-2026-0704", "2026-07-14", "Summer", "Rentals", "RNT-MTB-ENDURO", "Full Suspension Enduro MTB 1-Day Rental", 2, 85.00, 170.00, "Credit Card", "Bike Park Guests"),
        ("TXN-2026-0705", "2026-07-18", "Summer", "Retail Softgoods", "HLM-POC-KORT-M", "POC Kortal Race MIPS Bike Helmet", 1, 279.00, 279.00, "Credit Card", "Enduro Rider"),
        ("TXN-2026-0706", "2026-07-22", "Summer", "Workshop", "WRK-BIK-BLEED", "Hydraulic Disc Brake Bleed (Rear)", 1, 35.00, 35.00, "Debit Card", "Local Cyclist"),
        ("TXN-2026-0707", "2026-07-25", "Summer", "Rentals", "RNT-BIKE-VALLEY", "Valley Pathway Cruiser 1-Day Rental", 3, 45.00, 135.00, "Credit Card", "Family Vacationer"),
        ("TXN-2026-0708", "2026-07-29", "Summer", "Retail Softgoods", "HYD-CAM-MULE-12L", "CamelBak M.U.L.E. Pro 14 Hydration Pack", 1, 179.99, 179.99, "Credit Card", "Trail Rider"),
        ("TXN-2026-0801", "2026-08-04", "Summer", "Rentals", "RNT-BIKE-EMTB", "Specialized Turbo Levo E-MTB 1-Day", 1, 115.00, 115.00, "Credit Card", "Resort Guest"),
        ("TXN-2026-0802", "2026-08-08", "Summer", "Workshop", "WRK-BIK-TUBELESS", "Tubeless Tire Setup & Sealant Refresh", 1, 30.00, 30.00, "Debit Card", "Local Mountain Biker"),
        ("TXN-2026-0803", "2026-08-12", "Summer", "Tours", "EXP-LAK-CRUISE", "Okanagan Lake Private Sunset Charter", 1, 1250.00, 1250.00, "Credit Card", "Anniversary Booking"),
        ("TXN-2026-0804", "2026-08-16", "Summer", "Retail Softgoods", "BOT-YET-RAMB-26OZ", "YETI Rambler 26 oz Vacuum Bottle", 2, 48.00, 96.00, "Apple Pay", "Trail Hiker"),
        ("TXN-2026-0805", "2026-08-22", "Summer", "Rentals", "RNT-MTB-ENDURO", "Full Suspension Enduro MTB 1-Day Rental", 1, 85.00, 85.00, "Credit Card", "Resort Guest")
    ]

    ws8.append(["Everything in the Mountains — Multi-Season Store Sales & Service Transaction Log"])
    ws8.append(["Sample transaction records demonstrating Winter and Summer retail sales, fleet rentals, and workshop tuning turnover. All amounts CAD."])
    ws8.append([])
    ws8.append(sales_headers)

    ws8["A1"].font = title_font
    ws8["A2"].font = subtitle_font

    for col_idx in range(1, len(sales_headers) + 1):
        cell = ws8.cell(row=4, column=col_idx)
        cell.font = header_font
        cell.fill = header_fill
        cell.border = header_border
        cell.alignment = Alignment(horizontal="center" if "CAD" in sales_headers[col_idx-1] or "Qty" in sales_headers[col_idx-1] or "Date" in sales_headers[col_idx-1] or "Season" in sales_headers[col_idx-1] else "left", vertical="center")

    for row_idx, data_row in enumerate(sales_data, start=5):
        ws8.append(list(data_row))
        curr_fill = zebra_fill if (row_idx % 2 == 0) else white_fill

        for col_idx in range(1, len(data_row) + 1):
            c = ws8.cell(row=row_idx, column=col_idx)
            c.font = regular_font
            c.fill = curr_fill
            c.border = border_thin

            val = c.value
            header_name = sales_headers[col_idx - 1]

            if "CAD" in header_name:
                c.number_format = currency_format
                c.alignment = Alignment(horizontal="right")
            elif "Qty" in header_name:
                c.number_format = int_format
                c.alignment = Alignment(horizontal="center")
            elif header_name == "Transaction ID":
                c.font = code_font
            elif header_name == "Season":
                c.alignment = Alignment(horizontal="center")
                c.font = bold_font
            elif header_name == "Date":
                c.alignment = Alignment(horizontal="center")

    ws8.freeze_panes = "A5"

    # =========================================================================
    # Auto-adjust column widths for all sheets
    # =========================================================================
    for sheet in wb.worksheets:
        for col in sheet.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                if cell.row < 4:
                    continue
                if cell.value is not None:
                    val_str = str(cell.value)
                    if len(val_str) > max_len:
                        max_len = len(val_str)
            col_width = min(max(max_len + 4, 12), 52)
            sheet.column_dimensions[col_letter].width = col_width

        sheet.row_dimensions[4].height = 26
        sheet.row_dimensions[1].height = 22
        sheet.row_dimensions[2].height = 16

    target_dir = os.path.dirname(os.path.abspath(__file__))
    target_path = os.path.join(target_dir, "Alpine_Wave_Synthetic_Mountain_Data.xlsx")
    wb.save(target_path)
    print(f"Successfully generated: {target_path}")
    print(f"Sheets created ({len(wb.worksheets)}): {[s.title for s in wb.worksheets]}")

if __name__ == "__main__":
    build_everything_in_the_mountains_excel()
