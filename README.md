# Tiny Tails Isopod Market

ขอไอเดียการทำ การทำแอปสำหรับ การขาย ไอโซพอต ให้กับต่างชาติ
ควรที่จะมีการประมาณการค่าส่งออก และ ภาษีส่งออก ด้วยหรือไม่
ชื่อสำหรับทำป้าย
CUBARIS SP. “PANDA KING” [ FAMILY : ARMADILLIDAE ]
CUBARIS SP. “CAPPUCCINO” [ FAMILY : ARMADILLIDAE ]
CUBARIS SP. “WHITE SHARK” [ FAMILY : ARMADILLIDAE ]
CUBARIS MURINA “ORANGE” [ FAMILY : ARMADILLIDAE ]
CUBARIS MURINA “PAPAYA” [ FAMILY : ARMADILLIDAE ]
CUBARIS SP. “ORANGE FREEZY” [ FAMILY : ARMADILLIDAE ]
CUBARIS SP. “FIREFLY HOLY LIGHT” [ FAMILY : ARMADILLIDAE ]
PORCELLIO LAEVIS “DAIRY COW” [ FAMILY : PORCELLIONIDAE ]
CUBARIS SP. “RUBBER DUCKY” [ FAMILY : ARMADILLIDAE ]
CUBARIS MURINA “WILD TYPE” [ FAMILY : ARMADILLIDAE ]
CUBARIS SP. “LEMON BLUE” [ FAMILY : ARMADILLIDAE ]
ARMADILLIDIUM MACULATUM “WHITE ZEBRA” [ FAMILY : ARMADILLIDIIDAE ]
CUBARIS MURINA “GLACIER” [ FAMILY : ARMADILLIDAE ]
CUBARIS SP. “AMBER DUCKY” [ FAMILY : ARMADILLIDAE ]
ARMADILLIDIUM “GESTROI” [ FAMILY : ARMADILLIDIIDAE ]
PORCELLIONIDES PRUINOSUS “ORANGE DALMATIAN” [ FAMILY : PORCELLIONIDAE ]
ARMADILLIDIUM “PERACCAE” [ FAMILY : ARMADILLIDIIDAE ]
CUBARIS SP. “GOLDEN POWDER” [ FAMILY : ARMADILLIDAE ]
CUBARIS SP. “DAKMIL” [ FAMILY : ARMADILLIDAE ]
NAGURUS CRISTATUS [ FAMILY : TRACHELIPODIDAE ]
NAGURUS NANUS [ FAMILY : TRACHELIPODIDAE ]
TRICHORHINA SP. [ FAMILY : PLATYARTHRIDAE ]
PORCELLIONIDES SEXFASCIATUS SSP. SEXFASCIATUS [ FAMILY : PORCELLIONIDAE ]
CUBARIS SP. “HAPPY NUN” [ FAMILY : ARMADILLIDAE ]
CUBARIS SP. “AMBER PANDA” [ FAMILY : ARMADILLIDAE ]
CUBARIS SP. “PENGUIN” [ FAMILY : ARMADILLIDAE ]
TROGLODILLO SP. “SOIL” [ FAMILY : ARMADILLIDAE ]
ARMADILLIDIUM VULGARE “ST. LUCIA” [MIX MORPH] [ FAMILY : ARMADILLIDIIDAE ]
PORCELLIO ORNATUS “YELLOW” [ FAMILY : PORCELLIONIDAE ]
CUBARIS SP. “RED PANDA” [FAMILY : ARMADILLIDAE]
CUBARIS SP. "AMBER FIREFLY DCF" [FAMILY : ARMADILLIDAE]
CUBARIS SP. "RED PAK CHONG" [FAMILY : ARMADILLIDAE]
ชื่อร้าน TinyTails
คุณเพิ่มสิ่งที่จำเป็นเองได้เลย และ สร้างได้เลย

Locked:
- Visual Direction: "Dark Vivarium" theme picked by the user, updated to warm charcoal backgrounds with vibrant orange (#F97316) and yellow (#FACC15) accents, glowing rarity badges, high-contrast collector cards, macro photography aesthetic.
- Brand Name: "TinyTails" (TinyTails Exotics • Thailand) with tagline "Captive-Bred Thai Isopods".
- Catalog Data: All 32 isopod species and families provided by the user must be populated in the catalog:
  - Armadillidae (Cubaris Rubber Ducky, Panda King, White Shark, Cappuccino, Murina Orange, Murina Papaya, Orange Freezy, Firefly Holy Light, Murina Wild Type, Lemon Blue, Murina Glacier, Amber Ducky, Golden Powder, Dakmil, Happy Nun, Amber Panda, Penguin, Red Panda, Amber Firefly DCF, Red Pak Chong; Troglodillo sp. Soil)
  - Armadillidiidae (Armadillidium maculatum White Zebra, Gestroi, Peraccae, Vulgare St. Lucia Mix)
  - Porcellionidae (Porcellio laevis Dairy Cow, Porcellionides pruinosus Orange Dalmatian, Porcellionides sexfasciatus ssp. sexfasciatus, Porcellio ornatus Yellow)
  - Trachelipodidae (Nagurus cristatus, Nagurus nanus)
  - Platyarthridae (Trichorhina sp.)
- Core Features Settled:
  1. Species Detail Page with colony pack selector (6x Starter, 10x Colony, 20x Breeder pack), Live Arrival Guarantee (LAG) banner (2-hour unboxing video requirement), and instant Landed Cost Estimator (country + zip code destination, weather status indicator, price breakdown of isopod + Bangkok air cargo / transshipper fee + domestic FedEx priority overnight).
  2. Export Batch Schedule: Countdown to the next export flight departing Bangkok (e.g. Nov 28) with "Pre-Order for Next Batch" CTA.
  3. Checkout & Flight Route: 3-step transit journey (Bangkok packing -> Cargo flight to clearance hub -> FedEx Priority Overnight to customer door), climate & packaging check (UniHeat pack / insulated box), and explicit LAG policy checkbox agreement.
  4. Label & Tag Studio: Printable Breeder Tub Labels (75x50mm), export box stickers, and specimen tags featuring TinyTails branding, species name, family, humidity/temp specs, care requirements, and QR codes linking to species care guides, with print/PDF export.

Open:
- Complete web app architecture using React, Tailwind CSS, Lucide icons, and shadcn-ui components.
- Interactive shopping cart, currency toggle (USD, EUR, GBP, JPY), and simulated Stripe / Apple Pay checkout with order confirmation and tracking number.
- Weather check simulator (mocking temperature check by US/EU zip code and warning if destination is in weather hold <10°C or >32°C).
- Search and filter by Family (All, Armadillidae, Armadillidiidae, Porcellionidae, Others), difficulty level, and rarity.
- Printable Tub Label preview and PDF generation / print view ready for thermal or standard label printers.
- Responsive layout across mobile (393px), tablet, and desktop (1280px).

build a real working app, not a clickable prototype; the screen and kit files show layout, content and look (a wireframe's, structure only) and are never code to copy. The screens are the moments the user designed, not the whole product. Before building, walk through each flow as its user would and design what the pictures leave out, as a product designer would for this product: the steps a flow needs to finish and how the app responds to what the user does, including the moments its users will actually run into, like waiting on something or finding nothing yet. Add nothing a user of this product would never meet, and keep an app the user wants simple, simple. Never leave a step the product's core flows need as "coming soon", unless the brief says the user chose to. Where such a step needs an outside service, build every part up to it and say in your reply what's left to connect. Fill product gaps only, never a look the design set: an added step reuses the UI kit's tokens, chrome and parts and the nearest designed screen's layout, with no new visual direction. Look at every screen's picture before writing code; design.md says which picture or sheet holds each screen. Open the UI kit's shells and parts HTML for the header, tab bar, composer and components, not only its tokens. Use each finished screen's copy exactly as design.md lists it; never invent copy for one. A wireframe under design.md's Wireframes gives structure only: build it in the design's look, as design.md says. The screens' photos are placeholders for the mockups only: replace every photo design.md lists with the user's own upload for it, else as design.md says (a photo without people re-composed with imagegen--edit_image from it as a reference, a photo of people generated from its brief and never from the photo), and ship no set photo or its URL. Build and check each screen at the canvas it was drawn at: phone 393×764, tablet landscape 1133×744, tablet portrait 744×1133, desktop 1280×832. After building, screenshot the app at those sizes and states, compare each finished screen with its picture, and fix every visual difference you didn't choose; check a wireframe's screen against its structure, never its grey look. End your reply with "Changed from the mockups": each deliberate change and why, and "Added beyond the mockups": each step, state or interaction you built that no screen shows.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tiny-tails-isopod-market.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a7324c77-24cc-4f03-9fe6-9f7d3331dbad).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
