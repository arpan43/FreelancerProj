import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientName, projectTitle, projectDescription, estimatedAmount, timeline, validUntil } = body

    if (!clientName || !projectTitle || !projectDescription || !estimatedAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const prompt = `You are a professional proposal writer. Create a comprehensive business proposal based on the following information:

Client: ${clientName}
Project: ${projectTitle}
Description: ${projectDescription}
Budget: $${estimatedAmount}
Timeline: ${timeline || "To be determined"}

Generate a detailed proposal with the following sections. Return ONLY valid JSON without any markdown formatting or code blocks:

{
  "description": "2-3 paragraph professional project description that highlights value and benefits",
  "scopeOfWork": "Detailed scope with 4-6 bullet points covering all project phases",
  "deliverables": "4-5 specific deliverables the client will receive",
  "timeline": "Professional timeline with key milestones",
  "items": [
    {
      "title": "Phase/Service name",
      "description": "What this includes",
      "quantity": 1,
      "rate": amount
    }
  ]
}

Make it professional, persuasive, and tailored to the specific project. The items should break down the estimated budget logically across 3-5 project phases or services.`

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.NEXT_PUBLIC_AZURE_DEPLOYMENT}/chat/completions?api-version=2023-05-15`,
      {
        method: "POST",
        headers: {
          "api-key": process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are a professional proposal writer. Always respond with valid JSON only, no markdown or code blocks.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          model: "gpt-4o",
          temperature: 0.7,
          max_tokens: 2000,
        }),
      },
    )

    if (!res.ok) {
      const errorData = await res.text()
      console.error("Azure OpenAI API Error:", errorData)
      return NextResponse.json({ error: "AI service unavailable", details: errorData }, { status: 500 })
    }

    const data = await res.json()
    let aiContent = data.choices?.[0]?.message?.content

    if (!aiContent) {
      return NextResponse.json({ error: "No content generated from AI" }, { status: 500 })
    }

    // Clean up the AI response to extract JSON
    let proposalData
    try {
      // Remove markdown code blocks if present
      aiContent = aiContent.replace(/```json\s*|\s*```/g, "").trim()

      // Try to find JSON in the content
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiContent = jsonMatch[0]
      }

      proposalData = JSON.parse(aiContent)
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent)
      console.error("Parse error:", parseError)

      // Fallback: create a structured proposal
      const budget = Number(estimatedAmount)
      proposalData = {
        description: `We are excited to present this comprehensive proposal for ${projectTitle}. ${projectDescription} This project represents an excellent opportunity to deliver exceptional value and achieve your business objectives through our proven expertise and methodical approach.

Our team brings extensive experience in similar projects, ensuring we understand the unique challenges and requirements involved. We are committed to delivering high-quality results that exceed your expectations while maintaining clear communication throughout the entire process.`,

        scopeOfWork: `• Initial consultation and requirements gathering
• Detailed project planning and timeline development  
• ${projectTitle.toLowerCase().includes("website") || projectTitle.toLowerCase().includes("web") ? "Design and development of all web components" : "Core development and implementation"}
• Quality assurance and testing procedures
• ${projectTitle.toLowerCase().includes("website") || projectTitle.toLowerCase().includes("web") ? "Deployment and launch support" : "Delivery and implementation support"}
• Post-launch support and documentation`,

        deliverables: `• Complete ${projectTitle.toLowerCase()}
• Comprehensive project documentation
• ${projectTitle.toLowerCase().includes("website") || projectTitle.toLowerCase().includes("web") ? "Responsive design for all devices" : "Full implementation package"}
• Quality assurance reports
• Training materials and support documentation`,

        timeline:
          timeline ||
          "Project will be completed in phases over 6-8 weeks with regular milestone reviews and client feedback sessions.",

        items: [
          {
            title: "Planning & Discovery",
            description: "Requirements gathering, planning, and project setup",
            quantity: 1,
            rate: Math.round(budget * 0.2),
          },
          {
            title: "Development Phase",
            description: "Core development and implementation work",
            quantity: 1,
            rate: Math.round(budget * 0.6),
          },
          {
            title: "Testing & Delivery",
            description: "Quality assurance, testing, and final delivery",
            quantity: 1,
            rate: Math.round(budget * 0.2),
          },
        ],
      }
    }

    // Validate the structure
    if (!proposalData.description || !proposalData.scopeOfWork || !proposalData.deliverables) {
      return NextResponse.json({ error: "Invalid proposal structure generated" }, { status: 500 })
    }

    return NextResponse.json(proposalData)
  } catch (error) {
    console.error("Error in generate-proposal API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
