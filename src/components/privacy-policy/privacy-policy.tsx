import React from 'react'
import { privacyTerms } from './policy-data'

function PrivacyPolicy() {
    return (
        <div>
            <div className='py-32 px-6 bg-[#F07639] text-white'>
                <p className='text-4xl font-bold text-center'>Privacy Policy for Grealty LLC DBA Snaphomz</p>

            </div>
            <div className='p-12'>
                <p><strong>Effective Date: </strong>{privacyTerms?.effectiveDate}</p>
                <p><strong>Last Updated: </strong>{privacyTerms?.lastUpdated}</p>
                <p className='py-12 text-md'>{privacyTerms?.description}</p>
                <div>
                    {
                        privacyTerms?.terms?.map((term: any, idx) => {
                            return (
                                <div key={idx} className='py-6'>
                                    <div className='flex gap-4 text-xl font-bold'>
                                        <p>{idx + 1}.</p>
                                        <p>{term?.title}</p>
                                    </div>
                                    <p className='pt-8 text-md'>{term?.description}</p>
                                    {term.categories && term?.categories.map((category: any, index: any) => (
                                        <div key={index}>
                                            {category.category && <h2 className='font-bold py-8 pb-4'>{category.category}</h2>}
                                            {category?.items?.map((item: any, idx: any) => (
                                                <div key={idx} className='pt-6'>
                                                    <div className='flex items-center'>
                                                        <h3 className='font-bold '>{idx + 1}. {item.type}:</h3>
                                                        {item?.description && <span>{item?.description}</span>}
                                                    </div>
                                                    <ul style={{ listStyleType: 'disc', marginLeft: '12px', opacity: '50%', fontSize: '14px' }}>
                                                        {item?.details?.map((detail: any, detailIdx: any) => (
                                                            <li key={detailIdx}>{detail}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))
                                            }
                                        </div>
                                    ))}
                                </div>
                            )
                        })
                    }
                </div>
            </div>

        </div>
    )
}

export default PrivacyPolicy