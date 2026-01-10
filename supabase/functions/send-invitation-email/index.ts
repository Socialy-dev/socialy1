import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Secure CORS: only allow requests from your frontend domain
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedOrigins = [
    Deno.env.get("FRONTEND_URL"),
    "http://localhost:5173",
    "http://localhost:3000",
    "https://lypodfdlpbpjdsswmsni.supabase.co"
  ].filter(Boolean);

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  return allowedOrigins[0] || "*";
};

interface InvitationEmailRequest {
  email: string;
  inviteLink: string;
  role: string;
  pages: string[];
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("Origin");
  const corsHeaders = {
    "Access-Control-Allow-Origin": getAllowedOrigin(origin),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, inviteLink, role, pages }: InvitationEmailRequest = await req.json();

    if (!email || !inviteLink) {
      return new Response(
        JSON.stringify({ error: "Email et lien d'invitation requis" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const pagesFormatted = pages.map(p => {
      const labels: Record<string, string> = {
        "dashboard": "Dashboard",
        "relations-presse": "Relations Presse",
        "social-media": "Social Media",
        "profile": "Profil"
      };
      return labels[p] || p;
    }).join(", ");

    const roleLabel = role === "admin" ? "Administrateur" : "Utilisateur";

    const emailResponse = await resend.emails.send({
      from: "Socialy <onboarding@resend.dev>",
      to: [email],
      subject: "Vous êtes invité(e) à rejoindre Socialy",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                        ✨ Bienvenue sur Socialy
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Bonjour,
                      </p>
                      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                        Vous avez été invité(e) à rejoindre la plateforme <strong>Socialy</strong> en tant que <strong>${roleLabel}</strong>.
                      </p>
                      
                      <!-- Role Badge -->
                      <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                        <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">Vos accès :</p>
                        <p style="color: #374151; font-size: 15px; margin: 0; font-weight: 500;">
                          📋 ${pagesFormatted}
                        </p>
                      </div>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 10px 0 30px;">
                            <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                              Créer mon compte
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0;">
                        Ce lien expirera dans 7 jours. Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                        © 2024 Socialy. Tous droits réservés.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-invitation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
