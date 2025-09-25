import React from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { setProcessList } from '@/slices/mortgage/question.slice';
import { error, success } from '@/components/alert/notify';
import { CreateAnswerInput } from '@/intferfaces/form';

export const useQuestion = (handleCb?: () => void) => {

  const dispatch = useAppDispatch()

  const GRAPHQL_URI = process.env.NEXT_PUBLIC_MORTGAGE_SERIVCE_GRAPHQL_URL || "http://153.92.214.220:4001/graphql"

  const getQuestionsListQuery = useMutation({
    mutationKey: ['use-question-mutation'],
    mutationFn: async (id: Number) => {
      const response = await axios.post(GRAPHQL_URI, {
        query: `
                 query { 
                 process(id: ${id}) {
                   name
                   id
                    steps {
                     id
                     title
                     description
                     questions {
                       content
                       order
                    }
                  }
               }
            }
              `,
      });

      return response.data;
    },
    onSuccess: (data) => {
      console.log(data.data.process)
      dispatch(setProcessList(data.data.process));
      handleCb?.();

    },
    onError: (err: any) => {
      console.log(err, 'line');
      error({ message: err?.response?.data?.message });
    },
  })

  const createAnswerQuery = useMutation({
    mutationKey: ['use-question-mutation'],
    mutationFn: async (createAnswer: CreateAnswerInput) => {
      const response = await axios.post(GRAPHQL_URI, {
        query: `
        mutation CreateAnswer {
          createAnswer(createAnswerInput: {
            processId: ${createAnswer.processId},
            stepId: ${createAnswer.stepId},
            questionId: ${createAnswer.questionId},
            userId: "${createAnswer.userId}",
            response: { answer: "${createAnswer.response.answer}" }
          }) {
            id
            processId
            stepId
            questionId
            userId
            response
          }
        }
      `,
      });

return response.data;
    },
onSuccess: (data) => {
  console.log(data.data.process)
  handleCb?.();

},
  onError: (err: any) => {
    console.log(err, 'line');
    error({ message: err?.response?.data?.message });
  },
  })

const generateXlsQuery = useMutation({
  mutationKey: ['use-question-mutation'],
  mutationFn: async (userId: String) => {
    const response = await axios.post(GRAPHQL_URI, {
      query: `
         mutation { generateExcelFile(userId: "${userId}")}
            `,
    });
    return response.data;
  },
  onSuccess: (data) => {
    success({ message: 'CSV Generated Successfully' });
    console.log(data.data.process)
    
    handleCb?.();
  },
  onError: (err: any) => {
    console.log(err, 'line');
    error({ message: err?.response?.data?.message });
  },
})

return { getQuestionsListQuery, createAnswerQuery, generateXlsQuery }
}
