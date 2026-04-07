'use client'
import { useState } from "react";

type Question = {
    id: number;
    question: string;
    A: string;
    B: string;
    C: string;
    D: string;
}

type QuestionProps = {
    questions: Question[];
};

export default function Questions({questions}: QuestionProps){
    const [answerArray, setAnswerArray] = useState([""]);
    
      function updateArray(index: number, answer: string) {
        const tempArray = [...answerArray];
        tempArray[index - 1] = answer;
        setAnswerArray(tempArray);
      }
    return (
        <div className="flex justify-center items-center w-9/10 flex-col mt-10">
            {questions.map((question) => (
                <div key={question.id} className="bg-[#D6CAB9] rounded-sm p-8 w-9/10 mb-15">
                <h1>Question {question.id}</h1>
                <p>{question.question}</p>
                <div className="pt-5 flex flex-col">
                <div className="flex flex-row pb-3">
                    <button className="pr-64" onClick={() => updateArray(question.id, "A")}>A: {question.A}</button>
                    <button onClick={() => updateArray(question.id, "B")}>B: {question.B}</button>
                </div>
                <div className="flex flex-row">
                    <button className="pr-73" onClick={() => updateArray(question.id, "C")}>C: {question.C}</button>
                    <button onClick={() => updateArray(question.id, "D")}>D: {question.D}</button>
                </div>
                </div>
            </div>
            ))}
            <button className="bg-[#D6CAB9] rounded-sm p-2">
            Submit
            </button>
        </div>
    );
}