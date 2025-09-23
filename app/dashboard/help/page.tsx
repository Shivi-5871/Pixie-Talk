"use client";

import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, BookOpen } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Help & Support</h1>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="faq-1" title="How do I create a new project?">
              To create a new project, click the <b>+ New Project</b> button on the dashboard and follow the setup steps.
            </AccordionItem>
            <AccordionItem value="faq-2" title="Where can I find my generated images and videos?">
              All your generated assets are stored under the <b>Projects</b> section.
            </AccordionItem>
            <AccordionItem value="faq-3" title="How can I contact support?">
              You can contact support using the details below or by clicking the <b>Contact Support</b> button.
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Support Section */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            support@pixie-talk.com
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            +1 (800) 123-4567
          </Button>
        </CardContent>
      </Card>

      {/* Additional Resources Section */}
      <Card>
        <CardHeader>
          <CardTitle>Resources & Guides</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="link" className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            View Documentation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
