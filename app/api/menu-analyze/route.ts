import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY fehlt." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("images");

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Keine Bilder hochgeladen." },
        { status: 400 }
      );
    }

    const imageContents = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      if (!file.type.startsWith("image/")) {
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");

      imageContents.push({
        type: "input_image" as const,
        image_url: `data:${file.type};base64,${base64}`,
        detail: "high" as const,
      });
    }

    if (imageContents.length === 0) {
      return NextResponse.json(
        { error: "Keine gültigen Bilder gefunden." },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5.4-mini",

      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Du analysierst Speisekarten für Zelloo Restaurant AI.

Lies die hochgeladenen Speisekartenbilder sorgfältig.

Extrahiere ausschließlich Informationen, die auf den Bildern sichtbar sind.

Für jedes Gericht oder Getränk benötige ich:

- name
- category
- description
- price
- currency

WICHTIGE REGELN:

1. Erfinde niemals Gerichte oder Preise.
2. Wenn kein Preis eindeutig erkennbar ist, verwende null.
3. Schweizer Preise sollen als Zahlen ausgegeben werden.
4. Beispiel: "18.50 CHF" wird zu 18.50.
5. Wenn keine Währung sichtbar ist, verwende "CHF".
6. Doppelte Einträge nicht mehrfach ausgeben.
7. Behalte die Sprache und Schreibweise der Speisekarte möglichst bei.
8. Versuche Kategorien wie Pizza, Pasta, Getränke, Desserts usw. zu erkennen.

Antworte ausschließlich mit gültigem JSON in diesem Format:

{
  "items": [
    {
      "name": "Margherita",
      "category": "Pizza",
      "description": null,
      "price": 18.50,
      "currency": "CHF"
    }
  ]
}
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