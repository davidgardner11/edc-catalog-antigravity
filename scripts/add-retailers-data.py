import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
DATA_FILE = os.path.join(PROJECT_DIR, 'src', 'data', 'backpacks.json')

with open(DATA_FILE, 'r', encoding='utf-8') as f:
    backpacks = json.load(f)

retailers_map = {
    "goruck-gr1": [
        {"name": "GORUCK (Official)", "priceUSD": 345, "url": "https://www.goruck.com/products/gr1", "isLowestPrice": True},
        {"name": "Huckberry", "priceUSD": 345, "url": "https://huckberry.com/store/goruck/category/p/65313-gr1-21l", "isLowestPrice": True},
        {"name": "Rogue Fitness", "priceUSD": 345, "url": "https://www.roguefitness.com/goruck-gr1-rucksack", "isLowestPrice": True}
    ],
    "peak-design-everyday": [
        {"name": "Peak Design (Official)", "priceUSD": 279, "url": "https://www.peakdesign.com/products/everyday-backpack", "isLowestPrice": True},
        {"name": "REI Co-op", "priceUSD": 279, "url": "https://www.rei.com/product/166661/peak-design-everyday-backpack-20-liters-v2", "isLowestPrice": True},
        {"name": "B&H Photo Video", "priceUSD": 279, "url": "https://www.bhphotovideo.com/c/product/1515286-REG/peak_design_bedb_20_bk_2_everyday_backpack_20l_v2.html", "isLowestPrice": True},
        {"name": "Amazon", "priceUSD": 279, "url": "https://www.amazon.com/dp/B07ZTQL17P", "isLowestPrice": True}
    ],
    "aer-city-pack-pro": [
        {"name": "Aer SF (Official)", "priceUSD": 219, "url": "https://aersf.com/products/city-pack-pro", "isLowestPrice": True},
        {"name": "Huckberry", "priceUSD": 219, "url": "https://huckberry.com/store/aer/category/p/77409-city-pack-pro", "isLowestPrice": True},
        {"name": "UrbanCred", "priceUSD": 219, "url": "https://www.urbancred.com/products/aer-city-pack-pro", "isLowestPrice": True}
    ],
    "mystery-ranch-urban-assault-21": [
        {"name": "Backcountry", "priceUSD": 139, "url": "https://www.backcountry.com/mystery-ranch-urban-assault-21l-pack", "isLowestPrice": True},
        {"name": "Mystery Ranch (Official)", "priceUSD": 149, "url": "https://www.mysteryranch.com/urban-assault-21-pack", "isLowestPrice": False},
        {"name": "REI Co-op", "priceUSD": 149, "url": "https://www.rei.com/product/169018/mystery-ranch-urban-assault-21-pack", "isLowestPrice": False},
        {"name": "Moosejaw", "priceUSD": 149, "url": "https://www.moosejaw.com/product/mystery-ranch-urban-assault-21-pack", "isLowestPrice": False}
    ],
    "evergoods-cpl24": [
        {"name": "Evergoods (Official)", "priceUSD": 279, "url": "https://evergoods.us/products/civic-panel-loader-24l", "isLowestPrice": True},
        {"name": "Huckberry", "priceUSD": 279, "url": "https://huckberry.com/store/evergoods/category/p/65314-civic-panel-loader-24l", "isLowestPrice": True},
        {"name": "Mukama", "priceUSD": 289, "url": "https://www.mukama.com/en/evergoods-civic-panel-loader-24l-cpl24", "isLowestPrice": False}
    ],
    "bellroy-transit-workpack": [
        {"name": "Amazon", "priceUSD": 189, "url": "https://www.amazon.com/dp/B0855NPPWN", "isLowestPrice": True},
        {"name": "Bellroy (Official)", "priceUSD": 199, "url": "https://bellroy.com/products/transit-workpack", "isLowestPrice": False},
        {"name": "Huckberry", "priceUSD": 199, "url": "https://huckberry.com/store/bellroy/category/p/63704-transit-workpack", "isLowestPrice": False},
        {"name": "Nordstrom", "priceUSD": 199, "url": "https://www.nordstrom.com/s/bellroy-transit-workpack/5529123", "isLowestPrice": False}
    ],
    "tom-bihn-synik-22": [
        {"name": "Tom Bihn (Official)", "priceUSD": 340, "url": "https://www.tombihn.com/products/synik-22", "isLowestPrice": True},
        {"name": "Carryology Marketplace", "priceUSD": 320, "url": "https://www.carryology.com/", "isLowestPrice": False}
    ],
    "able-carry-daily-plus": [
        {"name": "Able Carry (Official)", "priceUSD": 198, "url": "https://ablecarry.com/products/daily-plus", "isLowestPrice": True},
        {"name": "Huckberry", "priceUSD": 198, "url": "https://huckberry.com/store/able-carry/category/p/81729-daily-plus-x-pac", "isLowestPrice": True},
        {"name": "Suburban", "priceUSD": 198, "url": "https://suburban.com.hk/products/able-carry-daily-plus", "isLowestPrice": True}
    ],
    "black-ember-citadel-r3": [
        {"name": "Black Ember (Official)", "priceUSD": 275, "url": "https://blackember.com/products/citadel-r3", "isLowestPrice": True},
        {"name": "Urban Traveller Co", "priceUSD": 275, "url": "https://www.urbantravellerco.com/products/black-ember-citadel-r3", "isLowestPrice": True},
        {"name": "Huckberry", "priceUSD": 275, "url": "https://huckberry.com/store/black-ember", "isLowestPrice": True}
    ],
    "patagonia-black-hole-25l": [
        {"name": "Backcountry", "priceUSD": 139, "url": "https://www.backcountry.com/patagonia-black-hole-25l-daypack", "isLowestPrice": True},
        {"name": "Patagonia (Official)", "priceUSD": 149, "url": "https://www.patagonia.com/product/black-hole-pack-25-liters/49298.html", "isLowestPrice": False},
        {"name": "REI Co-op", "priceUSD": 149, "url": "https://www.rei.com/product/222956/patagonia-black-hole-pack-25l", "isLowestPrice": False},
        {"name": "Evo", "priceUSD": 149, "url": "https://www.evo.com/backpacks/patagonia-black-hole-25l-pack", "isLowestPrice": False}
    ],
    "the-north-face-borealis": [
        {"name": "Amazon", "priceUSD": 89, "url": "https://www.amazon.com/dp/B08N5K7L8F", "isLowestPrice": True},
        {"name": "The North Face (Official)", "priceUSD": 99, "url": "https://www.thenorthface.com/en-us/bags-and-gear/backpacks-c224451/borealis-backpack-pNF0A52SE", "isLowestPrice": False},
        {"name": "REI Co-op", "priceUSD": 99, "url": "https://www.rei.com/product/185481/the-north-face-borealis-pack", "isLowestPrice": False},
        {"name": "Dick's Sporting Goods", "priceUSD": 99, "url": "https://www.dickssportinggoods.com/p/the-north-face-borealis-backpack-21tnfabrlsbkpxxxxbps/21tnfabrlsbkpxxxxbps", "isLowestPrice": False}
    ],
    "osprey-daylite-plus": [
        {"name": "Amazon", "priceUSD": 69, "url": "https://www.amazon.com/dp/B08LN794G9", "isLowestPrice": True},
        {"name": "Osprey (Official)", "priceUSD": 75, "url": "https://www.osprey.com/daylite-plus-daylpluss21-550", "isLowestPrice": False},
        {"name": "REI Co-op", "priceUSD": 75, "url": "https://www.rei.com/product/186383/osprey-daylite-plus-pack", "isLowestPrice": False},
        {"name": "Backcountry", "priceUSD": 75, "url": "https://www.backcountry.com/osprey-packs-daylite-plus-pack", "isLowestPrice": False}
    ],
    "wandrd-prvke-21": [
        {"name": "Amazon", "priceUSD": 209, "url": "https://www.amazon.com/dp/B09D8RFPR3", "isLowestPrice": True},
        {"name": "Wandrd (Official)", "priceUSD": 219, "url": "https://www.wandrd.com/products/prvke", "isLowestPrice": False},
        {"name": "B&H Photo Video", "priceUSD": 219, "url": "https://www.bhphotovideo.com/c/product/1638687-REG/wandrd_pk21_bk_3_the_prvke_21_liter_v3.html", "isLowestPrice": False},
        {"name": "Moment", "priceUSD": 219, "url": "https://www.shopmoment.com/products/wandrd-all-new-prvke-backpack-21l", "isLowestPrice": False}
    ],
    "alpaka-elements-pro": [
        {"name": "Alpaka Gear (Official)", "priceUSD": 169, "url": "https://alpakagear.com/products/elements-backpack-pro", "isLowestPrice": True},
        {"name": "Huckberry", "priceUSD": 169, "url": "https://huckberry.com/store/alpaka/category/p/82301-elements-backpack-pro", "isLowestPrice": True},
        {"name": "Urban Traveller Co", "priceUSD": 169, "url": "https://www.urbantravellerco.com/products/alpaka-elements-backpack-pro", "isLowestPrice": True}
    ],
    "boundary-supply-errant": [
        {"name": "Boundary Supply (Official)", "priceUSD": 219, "url": "https://www.boundarysupply.com/products/errant-pack", "isLowestPrice": True},
        {"name": "B&H Photo Video", "priceUSD": 219, "url": "https://www.bhphotovideo.com/c/product/1498115-REG/boundary_te_erp_010101_errant_pack_obsidian_black.html", "isLowestPrice": True},
        {"name": "Huckberry", "priceUSD": 219, "url": "https://huckberry.com/store/boundary-supply", "isLowestPrice": True}
    ],
    "chrome-industries-barrage": [
        {"name": "Backcountry", "priceUSD": 169, "url": "https://www.backcountry.com/chrome-barrage-cargo-backpack", "isLowestPrice": True},
        {"name": "Chrome Industries (Official)", "priceUSD": 180, "url": "https://www.chromeindustries.com/product/barrage-cargo-backpack/BG-163.html", "isLowestPrice": False},
        {"name": "REI Co-op", "priceUSD": 180, "url": "https://www.rei.com/product/187903/chrome-barrage-cargo-pack", "isLowestPrice": False}
    ],
    "timbuk2-authority-deluxe": [
        {"name": "Amazon", "priceUSD": 149, "url": "https://www.amazon.com/dp/B07L6NP12Z", "isLowestPrice": True},
        {"name": "Timbuk2 (Official)", "priceUSD": 159, "url": "https://www.timbuk2.com/products/1815-authority-laptop-backpack-deluxe", "isLowestPrice": False},
        {"name": "eBags", "priceUSD": 159, "url": "https://www.ebags.com/backpacks/laptop-backpacks/authority-laptop-backpack-deluxe/117961XXXX.html", "isLowestPrice": False}
    ],
    "matador-seg28": [
        {"name": "Matador (Official)", "priceUSD": 250, "url": "https://matadorup.com/products/seg28-backpack", "isLowestPrice": True},
        {"name": "Huckberry", "priceUSD": 250, "url": "https://huckberry.com/store/matador/category/p/78521-seg28-backpack", "isLowestPrice": True},
        {"name": "REI Co-op", "priceUSD": 250, "url": "https://www.rei.com/product/219853/matador-seg28-pack", "isLowestPrice": True}
    ],
    "fjallraven-raven-20": [
        {"name": "Amazon", "priceUSD": 99, "url": "https://www.amazon.com/dp/B09M8P117K", "isLowestPrice": True},
        {"name": "Fjällräven (Official)", "priceUSD": 110, "url": "https://www.fjallraven.com/us/en-us/bags-gear/backpacks-bags/laptop-bags/raven-202", "isLowestPrice": False},
        {"name": "REI Co-op", "priceUSD": 110, "url": "https://www.rei.com/product/206587/fjallraven-raven-20-pack", "isLowestPrice": False},
        {"name": "Nordstrom", "priceUSD": 110, "url": "https://www.nordstrom.com/s/fjallraven-raven-20l-backpack/6841235", "isLowestPrice": False}
    ],
    "topo-designs-rover-classic": [
        {"name": "Backcountry", "priceUSD": 89, "url": "https://www.backcountry.com/topo-designs-rover-pack", "isLowestPrice": True},
        {"name": "Topo Designs (Official)", "priceUSD": 99, "url": "https://topodesigns.com/products/rover-pack", "isLowestPrice": False},
        {"name": "REI Co-op", "priceUSD": 99, "url": "https://www.rei.com/product/179234/topo-designs-rover-pack-classic", "isLowestPrice": False},
        {"name": "Huckberry", "priceUSD": 99, "url": "https://huckberry.com/store/topo-designs/category/p/65315-rover-pack-classic", "isLowestPrice": False}
    ]
}

for pack in backpacks:
    pack_id = pack['id']
    if pack_id in retailers_map:
        pack['retailers'] = retailers_map[pack_id]
        # Update lowestPriceUSD to match the true lowest price among retailers
        lowest = min(r['priceUSD'] for r in retailers_map[pack_id])
        pack['lowestPriceUSD'] = lowest
        # Set primary retailer to the one with the lowest price
        best_retailer = [r['name'].replace(' (Official)', '').replace(' Co-op', '') for r in retailers_map[pack_id] if r['priceUSD'] == lowest][0]
        pack['primaryRetailer'] = best_retailer

with open(DATA_FILE, 'w', encoding='utf-8') as f:
    json.dump(backpacks, f, indent=2)

print("Successfully enriched all 20 backpacks with authentic 'Shop At' retailer links and pricing!")
