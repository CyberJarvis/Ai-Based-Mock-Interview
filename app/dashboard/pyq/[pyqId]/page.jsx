"use client";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { db } from "@/utils/db";
import { Question } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { parseAIJsonResponse, getFallbackQuestions } from "@/utils/jsonParser";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const page = ({ params }) => {
  const [questionData, setQuestionData] = useState();

  useEffect(() => {
    console.log(params.pyqId);
    getQuestionDetails();
  }, []);

  const getQuestionDetails = async () => {
    try {
      const result = await db
        .select()
        .from(Question)
        .where(eq(Question.mockId, params.pyqId));
      
      if (!result || result.length === 0) {
        console.error("No question data found");
        setQuestionData(getFallbackQuestions());
        return;
      }

      const rawResponse = result[0].MockQuestionJsonResp;
      const parseResult = parseAIJsonResponse(rawResponse);
      
      if (parseResult.success) {
        setQuestionData(parseResult.data);
        console.log("Successfully parsed question data:", parseResult.data);
      } else {
        console.error("Failed to parse question data:", parseResult.error);
        // Use fallback questions with job position from the data
        const jobPosition = result[0].jobPosition || 'General';
        setQuestionData(getFallbackQuestions(jobPosition));
      }
    } catch (error) {
      console.error("Error fetching question data:", error);
      setQuestionData(getFallbackQuestions());
    }
  };



  return (
    questionData && (
    <div className="p-10 my-5">
      <Accordion type="single" collapsible>
        {questionData &&
          questionData.map((item, index) => (
            <AccordionItem value={`item-${index + 1}`} key={index} className="mb-5"  >
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="w-full text-left">
                  <MarkdownRenderer 
                    content={item?.Question || ""} 
                    className="text-sm md:text-base prose-headings:text-left prose-p:text-left"
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <MarkdownRenderer 
                  content={item?.Answer || ""} 
                  className="text-sm"
                />
              </AccordionContent>
            </AccordionItem>
          ))}
      </Accordion>
    </div>
    )
  );
};

export default page;
