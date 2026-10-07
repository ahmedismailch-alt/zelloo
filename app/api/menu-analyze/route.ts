import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const STANDARD_CATEGORIES = [
  "Getränke",
  "Vorspeisen",
  "Hauptgerichte",
  "Desserts",
  "Snacks",
] as const;

// Keyword groups used to normalize whatever free-text category the AI
// extracted from the menu photo into one of our standard dashboard
// categories. Order matters: first match wins.
const CATEGORY_KEYWORDS: Array<{
  category: (typeof STANDARD_CATEGORIES)[number];
  keywords: string[];
}> = [
  {
    category: "Getränke",
    keywords: [
      "getr",
      "drink",
      "beverage",
      "cola",
      "kaffee",
      "coffee",
      "tee",
      "tea",
      "bier",
      "beer",
      "wein",
      "wine",
      "wasser",
      "water",
      "saft",
      "juice",
      "softdrink",
      "limonade",
      "cocktail",
      "aperitif",
      "spirituosen",
      "boisson",
      "bevande",
    ],
  },
  {
    category: "Desserts",
    keywords: [
      "dessert",
      "nachspeise",
      "süss",
      "suess",
      "kuchen",
      "cake",
      "eis",
      "glace",
      "tiramisu",
      "gelato",
      "torte",
      "dolci",
    ],
  },
  {
    category: "Vorspeisen",
    keywords: [
      "vorspeise",
      "antipasti",
      "starter",
      "appetizer",
      "salat",
      "salad",
      "suppe",
      "soup",
      "entrée",
      "entree",
    ],
  },
  {
    category: "Snacks",
    keywords: ["snack", "pommes", "fries", "fingerfood", "beilage", "side"],
  },
  {
    category: "Hauptgerichte",
    keywords: [
      "hauptgericht",
      "hauptspeise",
      "main",
      "pizza",
      "pasta",
      "burger",
      "steak",
      "fleisch",
      "meat",
      "fisch",
      "fish",
      "gericht",
      "plat",
    ],
  },
];

function normalizeCategory(rawCategory: string | null): string | null {
  if (!rawCategory) return rawCategory;

  const normalized = rawCategory.toLowerCase();

  for (const group of CATEGORY_KEYWORDS) {
    if (group.keywords.some((keyword) => normalized.includes(keyword))) {
      return group.category;
    }
  }

  // No keyword match: keep the AI's original category text so the
  // restaurant owner can still review and fix it manually.
  return rawCategory;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY fehlt." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey,
    });

    const formData = await request.formData();
    const files = formData.getAll("images");

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Keine Bilder hochgeladen." },
        { status: 400 }
      );
    }

    const imageContents: Array<{
      type: "input_image";
      image_url: string;
      detail: "high";
    }> = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;
      if (!file.type.startsWith("image/")) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");

      imageContents.push({
        type: "input_image",
        image_url: `data:${file.type};base64,${base64}`,
        detail: "high",
      });
    }

    if (imageContents.length === 0) {
      return NextResponse.json(
        { error: "Keine gültigen Bilder gefunden." },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",

      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Du bist Zelloo Restaurant AI.

Analysiere die hochgeladenen Speisekartenbilder sehr sorgfältig.

Extrahiere nur Informationen, die tatsächlich auf der Speisekarte sichtbar sind.

Für jeden Artikel benötige ich:

- name
- category
- description
- price
- currency

REGELN:

1. Erfinde niemals Gerichte, Getränke oder Preise.
2. Wenn ein Preis nicht eindeutig lesbar ist, verwende null.
3. Preise müssen als Zahlen ausgegeben werden.
4. Beispiel: CHF 18.50 wird zu 18.50.
5. Wenn keine Währung sichtbar ist, verwende CHF.
6. Doppelte Einträge nur einmal ausgeben.
7. Behalte Namen möglichst genau wie auf der Speisekarte.
8. Erkenne Kategorien wie Pizza, Pasta, Burger, Getränke, Desserts usw.
9. Wenn du bei einem Preis unsicher bist, verwende null statt zu raten.
10. Der Restaurantbesitzer wird die Ergebnisse vor dem Speichern überprüfen.
              `,
            },

            ...imageContents,
          ],
        },
      ],

      text: {
        format: {
          type: "json_schema",
          name: "zelloo_menu",
          strict: true,
          schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                    },
                    category: {
                      type: ["string", "null"],
                    },
                    description: {
                      type: ["string", "null"],
                    },
                    price: {
                      type: ["number", "null"],
                    },
                    currency: {
                      type: "string",
                    },
                  },
                  required: [
                    "name",
                    "category",
                    "description",
                    "price",
                    "currency",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["items"],
            additionalProperties: false,
          },
        },
      },
    });

    const result = JSON.parse(response.output_text);

    if (Array.isArray(result?.items)) {
      result.items = result.items.map((item: { category: string | null }) => ({
        ...item,
        category: normalizeCategory(item.category),
      }));
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Zelloo menu analysis error:", error);

    return NextResponse.json(
      {
        error: "Speisekarte konnte nicht analysiert werden.",
      },
      {
        status: 500,
      }
    );
  }
}
