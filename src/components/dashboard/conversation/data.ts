

export const agents = [
    {
      _id: "chat1",
      propertyCount: 2,
      properties: [
        { _id: "prop101", name: "Property A", status: "Available" },
        { _id: "prop102", name: "Property B", status: "Sold" },
      ],
      agent: {
        _id: "agent1",
        firstname: "John",
        fullname: "John Doe",
        lastname: "Doe",
        licence_number: "LIC12345",
      },
    },
    {
      _id: "chat2",
      propertyCount: 3,
      properties: [
        { _id: "prop201", name: "Property C", status: "Under Review" },
        { _id: "prop202", name: "Property D", status: "Available" },
        { _id: "prop203", name: "Property E", status: "Available" },
      ],
      agent: {
        _id: "agent2",
        firstname: "Jane",
        fullname: "Jane Smith",
        lastname: "Smith",
        licence_number: "LIC67890",
      },
    },
    {
      _id: "chat3",
      propertyCount: 1,
      properties: [
        { _id: "prop301", name: "Property F", status: "Sold" },
      ],
      agent: {
        _id: "agent3",
        firstname: "Sam",
        fullname: "Sam Wilson",
        lastname: "Wilson",
        licence_number: "LIC54321",
      },
    },
  ];

export const property = [
  {
      "address": "Plan 1923 Palladio PKWY",
      "city": "Folsom",
      "country": "US",
      "dateAdded": "2025-01-07T05:08:05Z",
      "dateUpdated": "2025-01-17T14:10:03Z",
      "descriptions": [
          {
              "dateSeen": "2025-01-17T00:13:00.000Z",
              "value": "Introducing Plan 1923 at Veranda in Stone Creek Village! This spacious single family home in Rancho Cordova, CA offers 4 beds, 3 baths, and 1,923 sq ft of living space. With a 2 car garage and a 2 story layout, this home provides plenty of room for families of all sizes. The downstairs showcases an open kitchen and great room, a coat closet, covered patio, and a full-size bathroom and bedroom. Upstairs, you'll find the inviting master bedroom with a spacious walk-in closet, linen cabinet, and bath, along with a convenient laundry room, linen cabinet, and two additional bedrooms with a bathroom just outside."
          }
      ],
      "domains": [
          "www.redfin.com"
      ],
      "features": [
          {
              "key": "Redfin Rental Estimate",
              "replace": "true",
              "value": [
                  "$3177 - $3277 / month"
              ]
          },
          {
              "key": "Listing Price Information",
              "value": [
                  "List Price: 504950"
              ]
          },
          {
              "key": "Location Information",
              "value": [
                  "Address: 340 Palladio Pkwy, Folsom CA 95670"
              ]
          },
          {
              "key": "Property Information",
              "value": [
                  "Living Area: 1923"
              ]
          },
          {
              "key": "Listing Information",
              "value": [
                  "Modification Timestamp: 2025-01-15T19:15:00.137Z",
                  "Standard Status: Active",
                  "Modification Timestamp: 2025-01-13T13:01:33.522Z",
                  "Modification Timestamp: 2025-01-12T17:17:45.774Z",
                  "Modification Timestamp: 2025-01-06T19:16:38.265Z",
                  "Inventory Type: Plan",
                  "Modification Timestamp: 2025-01-13T07:59:49.290Z",
                  "Modification Timestamp: 2025-01-16T16:35:05.326Z",
                  "Modification Timestamp: 2025-01-14T03:01:30.367Z",
                  "Plan Name: Plan 1923",
                  "Modification Timestamp: 2025-01-12T11:18:48.144Z",
                  "Modification Timestamp: 2025-01-13T17:18:52.468Z"
              ]
          },
          {
              "key": "Bedroom Information",
              "value": [
                  "# of Bedrooms Total: 4"
              ]
          }
      ],
      "floorSizeUnit": "sq ft",
      "floorSizeValue": 1923,
      "geoLocation": "POINT (-121.119456 38.650304)",
      "id": "hyEpP5QBfQaVAE5HtYP0",
      "imageURLs": [
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/22C/genMid.BB7F4F02C22C_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/22C/genMid.BB7F4F02C22C_1_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/22C/genMid.BB7F4F02C22C_2_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/22C/genMid.BB7F4F02C22C_3_0.jpg"
      ],
      "keys": [
          "us/ca/folsom/plan1923palladiopkwy"
      ],
      "latitude": "38.650304",
      "longitude": "-121.119456",
      "mlsNumber": "BB7F4F02C22C",
      "mostRecentPriceAmount": 504950,
      "mostRecentPriceDate": "2025-01-04T00:00:00.000Z",
      "mostRecentPriceDomain": "www.redfin.com",
      "mostRecentPriceFirstDateSeen": "2025-01-13T13:14:02.444Z",
      "mostRecentStatus": "For Sale",
      "mostRecentStatusDate": "2025-01-04T00:00:00.000Z",
      "mostRecentStatusFirstDateSeen": "2025-01-14T00:42:27.330Z",
      "numBathroom": 3,
      "numBedroom": 4,
      "postalCode": "95670",
      "prices": [
          {
              "amountMax": 504950,
              "amountMin": 504950,
              "currency": "USD",
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-14T08:12:32.042Z",
                  "2025-01-14T03:45:18.262Z",
                  "2025-01-13T13:14:02.444Z",
                  "2025-01-14T00:42:27.632Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 262.58
          },
          {
              "amountMax": 504950,
              "amountMin": 504950,
              "currency": "USD",
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-07T05:57:39.943Z",
                  "2025-01-07T01:14:48.798Z",
                  "2025-01-06T23:16:25.939Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 262.58
          },
          {
              "amountMax": 504950,
              "amountMin": 504950,
              "currency": "USD",
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-13T02:22:49.998Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 262.58
          },
          {
              "amountMax": 504950,
              "amountMin": 504950,
              "currency": "USD",
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-13T20:05:25.043Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 262.58
          },
          {
              "amountMax": 504950,
              "amountMin": 504950,
              "currency": "USD",
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-17T00:12:55.018Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 262.58
          },
          {
              "amountMax": 504950,
              "amountMin": 504950,
              "currency": "USD",
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-13T15:04:22.486Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 262.58
          },
          {
              "amountMax": 504950,
              "amountMin": 504950,
              "currency": "USD",
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-16T18:02:07.368Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 262.58
          },
          {
              "amountMax": 504950,
              "amountMin": 504950,
              "currency": "USD",
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-15T21:13:10.101Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 262.58
          },
          {
              "amountMax": 504950,
              "amountMin": 504950,
              "currency": "USD",
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-13T11:48:00.885Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 262.58
          }
      ],
      "province": "CA",
      "sourceURLs": [
          "https://www.redfin.com/CA/Folsom/Folsom/Plan-1923/home/194111129"
      ],
      "statuses": [
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-14T00:42:27.330Z",
                  "2025-01-14T08:12:31.733Z"
              ],
              "firstDateSeen": "2025-01-14T00:42:27.330Z",
              "lastDateSeen": "2025-01-14T08:12:31.733Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-16T18:02:07.061Z"
              ],
              "firstDateSeen": "2025-01-16T18:02:07.061Z",
              "lastDateSeen": "2025-01-16T18:02:07.061Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-15T21:13:09.797Z"
              ],
              "firstDateSeen": "2025-01-15T21:13:09.797Z",
              "lastDateSeen": "2025-01-15T21:13:09.797Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-14T03:45:17.928Z"
              ],
              "firstDateSeen": "2025-01-14T03:45:17.928Z",
              "lastDateSeen": "2025-01-14T03:45:17.928Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-13T20:05:24.702Z"
              ],
              "firstDateSeen": "2025-01-13T20:05:24.702Z",
              "lastDateSeen": "2025-01-13T20:05:24.702Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-13T02:22:49.692Z"
              ],
              "firstDateSeen": "2025-01-13T02:22:49.692Z",
              "lastDateSeen": "2025-01-13T02:22:49.692Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-13T11:48:00.606Z"
              ],
              "firstDateSeen": "2025-01-13T11:48:00.606Z",
              "lastDateSeen": "2025-01-13T11:48:00.606Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-17T00:12:54.687Z"
              ],
              "firstDateSeen": "2025-01-14T00:42:27.330Z",
              "lastDateSeen": "2025-01-17T00:12:54.687Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-13T13:14:02.125Z"
              ],
              "firstDateSeen": "2025-01-13T13:14:02.125Z",
              "lastDateSeen": "2025-01-13T13:14:02.125Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-07T05:57:39.656Z"
              ],
              "firstDateSeen": "2025-01-07T05:57:39.656Z",
              "lastDateSeen": "2025-01-07T05:57:39.656Z",
              "type": "For Sale"
          }
      ]
  },
  {
      "address": "3635 Panorama Dr",
      "assessedValues": [
          {
              "totalAmount": 140933,
              "year": 2024
          }
      ],
      "brokers": [
          {
              "agent": "Eva Bukac, Nick Papageorgiou, Debbie Mccallion & S",
              "company": "Toll Brothers",
              "dateSeen": "2025-01-11T08:05:38.710Z"
          }
      ],
      "city": "Folsom",
      "country": "US",
      "dateAdded": "2025-01-10T14:36:26Z",
      "dateUpdated": "2025-01-17T14:09:58Z",
      "descriptions": [
          {
              "dateSeen": "2025-01-17T00:13:00.000Z",
              "value": "Modern luxury meets elegant design in this stunning quick move-in home. Prepping meals is a breeze with the large center island and ample counter space. The open-concept kitchen flows effortlessly into the great room and dining room, making this floor plan ideal for entertaining. Secluded flex room with double doors makes for the perfect home office. Come experience your dream home by scheduling a tour. Disclaimer: Photos are images only and should not be relied upon to confirm applicable features."
          }
      ],
      "domains": [
          "www.redfin.com",
          "www.trulia.com"
      ],
      "features": [
          {
              "key": "Listed",
              "replace": "true",
              "value": [
                  "6 days ago"
              ]
          },
          {
              "key": "See Virtual Tour",
              "value": [
                  "https://my.matterport.com/show/?m=YDLPP6WZZRo&qs=1&play=1&nt=1&search=0"
              ]
          },
          {
              "key": "Property Type",
              "value": [
                  "Single Family Home"
              ]
          },
          {
              "key": "Listing Price Information",
              "value": [
                  "List Price: 864995"
              ]
          },
          {
              "key": "Location Information",
              "value": [
                  "Address: 3635 Panorama Dr, Folsom CA 95630"
              ]
          },
          {
              "key": "Property Information",
              "value": [
                  "Living Area: 1876"
              ]
          },
          {
              "key": "Listing Information",
              "value": [
                  "Modification Timestamp: 2025-01-11T22:39:17.675Z",
                  "Inventory Type: Spec",
                  "Modification Timestamp: 2025-01-13T16:50:30.342Z",
                  "Modification Timestamp: 2025-01-13T11:47:41.317Z",
                  "Plan Name: Julian",
                  "Modification Timestamp: 2025-01-16T23:36:03.243Z",
                  "Modification Timestamp: 2025-01-11T10:20:46.894Z",
                  "Modification Timestamp: 2025-01-11T01:43:02.563Z",
                  "Standard Status: Active",
                  "Modification Timestamp: 2025-01-14T11:32:06.530Z",
                  "Modification Timestamp: 2025-01-10T00:11:14.125Z",
                  "Modification Timestamp: 2025-01-11T17:05:00.216Z",
                  "Modification Timestamp: 2025-01-14T06:47:30.828Z"
              ]
          },
          {
              "key": "Price/Sqft",
              "value": [
                  "$461"
              ]
          },
          {
              "key": "HOA",
              "value": [
                  "None"
              ]
          },
          {
              "key": "Bedroom Information",
              "value": [
                  "# of Bedrooms Total: 2"
              ]
          }
      ],
      "floorSizeUnit": "sq ft",
      "floorSizeValue": 1876,
      "geoLocation": "POINT (-121.120013 38.620451)",
      "id": "_xalUJQByN4LkFz_KANG",
      "imageURLs": [
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/A95/genMid.29508EA48A95_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/A95/genMid.29508EA48A95_1_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/A95/genMid.29508EA48A95_2_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/A95/genMid.29508EA48A95_3_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/A95/genMid.29508EA48A95_4_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/A95/genMid.29508EA48A95_5_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/A95/genMid.29508EA48A95_6_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/A95/genMid.29508EA48A95_7_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/A95/genMid.29508EA48A95_8_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/A95/genMid.29508EA48A95_9_0.jpg"
      ],
      "keys": [
          "us/ca/folsom/3635panoramadr"
      ],
      "latitude": "38.620451",
      "longitude": "-121.120013",
      "mlsNumber": "29508EA48A95",
      "mostRecentBrokerAgent": "Eva Bukac, Nick Papageorgiou, Debbie Mccallion & S",
      "mostRecentBrokerCompany": "Toll Brothers",
      "mostRecentBrokerDateSeen": "2025-01-11T08:05:38.710Z",
      "mostRecentPriceAmount": 864995,
      "mostRecentPriceDate": "2025-01-04T00:00:00.000Z",
      "mostRecentPriceDomain": "www.redfin.com",
      "mostRecentPriceFirstDateSeen": "2025-01-10T00:18:04.534Z",
      "mostRecentStatus": "For Sale",
      "mostRecentStatusDate": "2025-01-04T00:00:00.000Z",
      "mostRecentStatusFirstDateSeen": "2025-01-11T08:05:38.710Z",
      "numBathroom": 2,
      "numBedroom": 2,
      "numFloor": 1,
      "parking": [
          "Garage"
      ],
      "postalCode": "95630",
      "prices": [
          {
              "amountMax": 864995,
              "amountMin": 864995,
              "currency": "USD",
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-11T06:44:05.439Z",
                  "2025-01-10T01:19:05.221Z",
                  "2025-01-10T00:18:04.534Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 461.08
          },
          {
              "amountMax": 864995,
              "amountMin": 864995,
              "currency": "USD",
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-11T18:17:45.056Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 461.08
          },
          {
              "amountMax": 864995,
              "amountMin": 864995,
              "currency": "USD",
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-13T14:38:27.930Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 461.08
          },
          {
              "amountMax": 864995,
              "amountMin": 864995,
              "currency": "USD",
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-17T00:12:54.127Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 461.08
          },
          {
              "amountMax": 864995,
              "amountMin": 864995,
              "currency": "USD",
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-11T08:05:38.710Z"
              ],
              "isSale": "true",
              "isSold": "false",
              "pricePerSquareFoot": 461
          },
          {
              "amountMax": 864995,
              "amountMin": 864995,
              "currency": "USD",
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-14T14:02:01.119Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 461.08
          },
          {
              "amountMax": 864995,
              "amountMin": 864995,
              "currency": "USD",
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-14T04:49:48.501Z",
                  "2025-01-14T11:02:34.089Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 461.08
          }
      ],
      "propertyType": "Single Family Dwelling",
      "province": "CA",
      "sourceURLs": [
          "https://www.redfin.com/CA/Folsom/3635-Panorama-Dr-95630/home/186996311",
          "https://www.trulia.com/home/3635-panorama-dr-folsom-ca-95630-339037051"
      ],
      "statuses": [
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-11T08:05:38.710Z"
              ],
              "firstDateSeen": "2025-01-11T08:05:38.710Z",
              "isUnderContract": "false",
              "lastDateSeen": "2025-01-11T08:05:38.710Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-12T06:13:16.097Z"
              ],
              "firstDateSeen": "2025-01-12T06:13:16.097Z",
              "lastDateSeen": "2025-01-12T06:13:16.097Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-14T04:49:48.162Z"
              ],
              "firstDateSeen": "2025-01-14T04:49:48.162Z",
              "lastDateSeen": "2025-01-14T04:49:48.162Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-17T00:12:53.723Z"
              ],
              "firstDateSeen": "2025-01-11T08:05:38.710Z",
              "lastDateSeen": "2025-01-17T00:12:53.723Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-14T11:02:33.772Z"
              ],
              "firstDateSeen": "2025-01-14T11:02:33.772Z",
              "lastDateSeen": "2025-01-14T11:02:33.772Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-11T14:24:27.464Z"
              ],
              "firstDateSeen": "2025-01-11T14:24:27.464Z",
              "lastDateSeen": "2025-01-11T14:24:27.464Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-10T01:19:04.840Z",
                  "2025-01-11T06:44:05.114Z",
                  "2025-01-10T00:18:04.197Z"
              ],
              "firstDateSeen": "2025-01-10T00:18:04.197Z",
              "lastDateSeen": "2025-01-11T06:44:05.114Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-14T14:02:00.800Z"
              ],
              "firstDateSeen": "2025-01-14T14:02:00.800Z",
              "lastDateSeen": "2025-01-14T14:02:00.800Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-11T18:17:44.676Z"
              ],
              "firstDateSeen": "2025-01-11T18:17:44.676Z",
              "lastDateSeen": "2025-01-11T18:17:44.676Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-12T12:48:01.637Z"
              ],
              "firstDateSeen": "2025-01-12T12:48:01.637Z",
              "lastDateSeen": "2025-01-12T12:48:01.637Z",
              "type": "For Sale"
          },
          {
              "date": "2025-01-04T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-13T14:38:27.593Z"
              ],
              "firstDateSeen": "2025-01-13T14:38:27.593Z",
              "lastDateSeen": "2025-01-13T14:38:27.593Z",
              "type": "For Sale"
          }
      ],
      "yearBuilt": 2025
  },
  {
      "address": "201 Rockglen Rd",
      "brokers": [
          {
              "agent": "Brian Martell",
              "company": "M.o.r.e. Real Estate Group",
              "dateSeen": "2025-01-17T00:11:49.304Z",
              "emails": [
                  "brianmartell@kw.com"
              ],
              "licenseNumber": "DRE #01344828",
              "phones": [
                  "916-804-0908",
                  "9168040908",
                  "9163652282",
                  "916-8040908"
              ],
              "role": "seller"
          },
          {
              "agent": "Jill Chauvet",
              "company": "Coldwell Banker Realty",
              "dateSeen": "2023-10-11T18:47:08.616Z",
              "licenseNumber": "DRE #01704582"
          },
          {
              "agent": "Pamela Samms",
              "company": "Real Estate Source Inc",
              "dateSeen": "2023-10-11T18:47:08.620Z",
              "licenseNumber": "DRE #01084374",
              "phones": [
                  "01084374"
              ]
          }
      ],
      "city": "Folsom",
      "congressionalDistrictHouse": 43,
      "country": "US",
      "county": "Sacramento",
      "countyFIPS": 6067,
      "currentOwnerType": "INDIVIDUAL",
      "dateAdded": "2019-12-22T06:29:57Z",
      "dateUpdated": "2025-01-17T14:05:43Z",
      "descriptions": [
          {
              "dateSeen": "2025-01-17T00:12:00.000Z",
              "value": "Charming and full of character, this 2 bed, 2 bath double-wide mobile home is located in one of the most desirable 55+ communities in central Folsom. As you enter, you're welcomed by a cozy living area that flows into a formal dining room featuring built-in cabinetry for added storage and charm. The bright kitchen offers ample storage and connects to a convenient office nook with even more space to stay organized. Beyond the kitchen is a secondary living area that opens to a lovely sunroom, perfect for relaxing year-round. The backyard is ideal for outdoor living, featuring a deck great for hosting and a storage shed to keep things tidy. This vibrant community offers picturesque walking paths, a beautiful park, and a spacious community center. Residents can enjoy the sparkling pool and serene views of the peaceful pond, creating a perfect environment for relaxation and socializing. Conveniently located near Folsom's shopping, dining, and recreational attractions, this home provides the perfect blend of comfort, convenience, and community living."
          },
          {
              "dateSeen": "2019-12-22T02:24:00.000Z",
              "value": "201 Rockglen Rd is a home in Folsom, CA 95630. Based on Redfin's Folsom data, we estimate the home's value is $148,255. Comparable nearby homes include 158 Leafwood Way, 241 Rockglen Rd, and 251 Stonebrook Dr. Nearby schools include Carl H. Sundahl Elementary School, Odyssey Learning Center and Compass Rose Nps. Nearby coffee shops include Folsom Grind and Starbucks. Nearby restaurants include Baja Fresh, Subway and Lolita's Authentic Mexican Cuisine. 201 Rockglen Rd is near Hannaford Family Park, Egloff Family Park and Main Dam Operations Area. This address can also be written as 201 Rockglen Road, Folsom, California 95630."
          },
          {
              "dateSeen": "2023-10-11T18:47:00.000Z",
              "value": "Desirable PINEBROOK VILLAGE! Truly a very sharp home located on a beautifully landscaped corner lot, with popular TWO CAR Carport! FORMAL LIVING ROOM & DINING ROOM. LIGHT BRIGHT KITCHEN. OVERSIZED FAMILY ROOM with SKYLIGHT. GREAT OFFICE and INSIDE LAUNDRY ROOM. Beautifully landscaped side yards for barbecuing, relaxing, entertaining, or a walkway leading to a peaceful creek. So much to list, you must see this home. This one won't last! Show more"
          }
      ],
      "domains": [
          "www.zillow.com",
          "www.xome.com",
          "www.redfin.com",
          "www.remax.com",
          "datafiniti.co",
          "www.mlslistings.com",
          "www.compass.com"
      ],
      "features": [
          {
              "key": "Water",
              "value": [
                  "Public"
              ]
          },
          {
              "key": "Laundry Features",
              "value": [
                  "Inside Area",
                  "Inside Room"
              ]
          },
          {
              "key": "Unit 1 Rent",
              "value": [
                  "$.00"
              ]
          },
          {
              "key": "4 Bedroom Annual Occupancy",
              "value": [
                  ".00%"
              ]
          },
          {
              "key": "# of Guest Space(s)",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Unit 1 HCD/HUD Decal",
              "value": [
                  "AAJ5500"
              ]
          },
          {
              "key": "Area Short Display",
              "value": [
                  "10630"
              ]
          },
          {
              "key": "Virtual Tour URL",
              "value": [
                  "https://201rockglenroad.com"
              ]
          },
          {
              "key": "Compass Type",
              "value": [
                  "Mobile/Manufactured"
              ]
          },
          {
              "key": "mls_newConstruction",
              "value": [
                  "false"
              ]
          },
          {
              "key": "Garage/Parking",
              "value": [
                  "Garage: 0 Car(s)",
                  "Awning Carport(s)",
                  "Covered Parking"
              ]
          },
          {
              "key": "mls_listingAgentOffice_name_1",
              "value": [
                  "M.O.R.E. Real Estate Group"
              ]
          },
          {
              "key": "Days on Compass",
              "replace": "true",
              "value": [
                  "41"
              ]
          },
          {
              "key": "Elevation",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Unit 1 Partial Baths",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Flooring",
              "value": [
                  "Laminate",
                  "Carpet",
                  "Other"
              ]
          },
          {
              "key": "Unit 2 Rent",
              "value": [
                  "$.00"
              ]
          },
          {
              "key": "Foundation",
              "value": [
                  "Block"
              ]
          },
          {
              "key": "Pool",
              "value": [
                  "false"
              ]
          },
          {
              "key": "# of 1 Bedroom Units",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Postal Code (95630) Transport Scores",
              "value": [
                  "Walking Score: 7/100 - Car-Dependent",
                  "Transit Score: 50/100 - Bikeable"
              ]
          },
          {
              "key": "Restrictions",
              "value": [
                  "Board Approval",
                  "Exterior Alterations"
              ]
          },
          {
              "key": "Unit 3 Partial Baths",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Unit 1 # of Rooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Redfin Virtual Tour",
              "replace": "true",
              "value": [
                  "https://201rockglenroad.com"
              ]
          },
          {
              "key": "Independent Parking Spaces",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Selling Agent",
              "value": [
                  "Buyer Agent Full Name: Pamela M Samms"
              ]
          },
          {
              "key": "Unit 1 Full Baths",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Make",
              "value": [
                  "Bendix Manor"
              ]
          },
          {
              "key": "Nearby Recently Sold Homes",
              "value": [
                  "267 Northwood Dr #267, Folsom, CA 95630",
                  "486 Nugget Dr, Folsom, CA 95630",
                  "581 Southwood Dr, Folsom, CA 95630"
              ]
          },
          {
              "key": "# of 2 Bedrooms Occupied",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Lot Features",
              "value": [
                  "Corner",
                  "Backyard",
                  "Auto Sprinkler F&R"
              ]
          },
          {
              "key": "Skirt",
              "value": [
                  "Wood"
              ]
          },
          {
              "key": "Census Tract",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "1 Bedroom Annual Occupancy",
              "value": [
                  ".00%"
              ]
          },
          {
              "key": "Garage Spaces",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Bedrooms",
              "value": [
                  "2"
              ]
          },
          {
              "key": "# of 1 Bedrooms Occupied",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Cross Street",
              "value": [
                  "Nugget Dr"
              ]
          },
          {
              "key": "Lot Information",
              "value": [
                  "Other Structures: Shed(s)",
                  "Lot Features: Corner, See Remarks",
                  "Lot Features: Auto Sprinkler F&R, Backyard, Corner"
              ]
          },
          {
              "key": "Directions to Property",
              "value": [
                  "Head west on US-50 W, Take exit 23 for Folsom Blvd, Use the left 2 lanes to turn left onto Folsom Blvd, Turn right onto Natoma St, Continue straight onto E Natoma St, Use the left 2 lanes to turn left onto Folsom Lake Crossing, Turn right onto Folsom-Auburn Rd, Take Leafwood Way to Rockglen Rd."
              ]
          },
          {
              "key": "Amenities",
              "value": [
                  "Private Outdoor Space",
                  "Garage",
                  "Air Conditioning",
                  "Deck",
                  "Storage Shed",
                  "Formal Dining Room",
                  "Washer / Dryer in Unit"
              ]
          },
          {
              "key": "Property Disclaimer",
              "value": [
                  "All measurements and calculations of area are approximate. Information provided by Seller/Other sources, not verified by Broker. 3cBR> All interested persons should independently verify accuracy of information. Provided properties may or may not be listed by the office/agent presenting the information. 3cBR> Copyright3c/A> &copy; 2024, MetroList Services, Inc. 3cBR> Any offer of compensation in the real estate content on this site is made exclusively to Broker Participants of the MetroList\u00ae MLS & Broker Participants of any MLS with a current reciprocal agreement with MetroList\u00ae that provides for such offers of compensation."
              ]
          },
          {
              "key": "Green Verification Year",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Open Parking Spaces",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Picture Count",
              "value": [
                  "38"
              ]
          },
          {
              "key": "# of Lots",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Photos Provided By",
              "value": [
                  "3rd Party Photographer"
              ]
          },
          {
              "key": "Total # Owner Occupied",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Middle or Junior School District",
              "value": [
                  "Folsom-Cordova"
              ]
          },
          {
              "key": "Unit 4 Partial Baths",
              "value": [
                  "0"
              ]
          },
          {
              "key": "# of 4 Bedroom Units",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Entry Level",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Association",
              "value": [
                  "false"
              ]
          },
          {
              "key": "# of 3 Bedroom Units",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Covered Spaces",
              "value": [
                  "0"
              ]
          },
          {
              "key": "xome.com Features",
              "replace": "false",
              "value": [
                  "DoorsWindows: Screened, Double Pane",
                  "GuestFacilities: 3",
                  "General: Fenced Yard.",
                  "SchoolDistrict: Folsom-cordova",
                  "Sewer: Public Sewer",
                  "Kitchen: Butler Pantry, Breakfast Area"
              ]
          },
          {
              "key": "Zip Code",
              "value": [
                  "95630"
              ]
          },
          {
              "key": "Width",
              "value": [
                  "24.0"
              ]
          },
          {
              "key": "County Transfer Tax Rate",
              "value": [
                  ".00%"
              ]
          },
          {
              "key": "Tandem Parking Spaces",
              "value": [
                  "0"
              ]
          },
          {
              "key": "MLS Source",
              "value": [
                  "MetroList Services, Inc."
              ]
          },
          {
              "key": "Exterior Features",
              "value": [
                  "Carport Awning",
                  "Roof: Composition",
                  "Roof: Other",
                  "Porch Awning",
                  "Exterior Features: Carport Awning, Patio Awning, Porch Awning",
                  "Patio Awning"
              ]
          },
          {
              "key": "Body Type",
              "value": [
                  "Mobile"
              ]
          },
          {
              "key": "Bath Features",
              "value": [
                  "Shower Stall(s)"
              ]
          },
          {
              "key": "Carport Spaces",
              "value": [
                  "0"
              ]
          },
          {
              "key": "xome.com Days on site",
              "replace": "true",
              "value": [
                  "81"
              ]
          },
          {
              "key": "Unit 3 Rent",
              "value": [
                  "$.00"
              ]
          },
          {
              "key": "Sewer",
              "value": [
                  "Public Sewer"
              ]
          },
          {
              "key": "City Transfer Tax Rate",
              "value": [
                  ".00%"
              ]
          },
          {
              "key": "Length",
              "value": [
                  "120.0"
              ]
          },
          {
              "key": "2nd Unit Approx SqFt",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "Location Information",
              "value": [
                  "State Or Province: CA",
                  "Street Address Filtered: 201 Rockglen Road",
                  "Directions: Enter Pinebrook Park, turn left at the Clubhouse, then turn left onto Rockglen Road to address.",
                  "County Or Parish: Sacramento",
                  "Postal Code: 95630",
                  "Street Number Numeric: 201",
                  "CrossStreet: Nugget Dr",
                  "Directions: Head west on US-50 W, Take exit 23 for Folsom Blvd, Use the left 2 lanes to turn left onto Folsom Blvd, Turn right onto Natoma St, Continue straight onto E Natoma St, Use the left 2 lanes to turn left onto Folsom Lake Crossing, Turn right onto Folsom-Auburn Rd, Take Leafwood Way to Rockglen Rd.",
                  "Street Address Filtered: 201 Rockglen Rd",
                  "CrossStreet: Nugget Drive",
                  "Unparsed Address: 201 Rockglen Rd, Folsom, CA 95630",
                  "Unparsed Address: 201 Rockglen Road, Folsom, CA 95630"
              ]
          },
          {
              "key": "Other Structures",
              "value": [
                  "Shed(s)"
              ]
          },
          {
              "key": "# of 4 Bedrooms Occupied",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Model",
              "value": [
                  "Bendix Manor"
              ]
          },
          {
              "key": "# Commercial Units",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Utility Information",
              "value": [
                  "Water Source: Public",
                  "Sewer: Public Sewer",
                  "Sewer: Sewer Connected",
                  "Utilities: Cable Available, Individual Electric Meter, Individual Gas Meter, Internet Available",
                  "Electric: 220 Volts in Kitchen, 220 Volts in Laundry",
                  "Utilities: Cable Available, Dish Antenna, Gas Plumbed, Individual Electric Meter",
                  "Water Source: Private"
              ]
          },
          {
              "key": "Bedroom Information",
              "value": [
                  "# of Bedrooms (Total): 2"
              ]
          },
          {
              "key": "Laundry",
              "value": [
                  "In Laundry Room",
                  "Laundry Area",
                  "220 Volt Outlet"
              ]
          },
          {
              "key": "Unit 2 Bedrooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Land Lease",
              "value": [
                  "false"
              ]
          },
          {
              "key": "# Studios Occupied",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Unit 3 # of Rooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Park/Marina Name",
              "value": [
                  "Pinebrook"
              ]
          },
          {
              "key": "# of Floors",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Spa",
              "value": [
                  "false"
              ]
          },
          {
              "key": "Parking Fee $",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "Berth Size Length",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "Unit 3 Approx SqFt",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "Unit 4 Approx SqFt",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "Association Fee",
              "value": [
                  "$.00"
              ]
          },
          {
              "key": "Unit Information",
              "value": [
                  "# of Units: 1"
              ]
          },
          {
              "key": "Utilities",
              "value": [
                  "Gas Plumbed",
                  "Individual Electric Meter",
                  "Dish Antenna",
                  "Electric",
                  "Cable Available"
              ]
          },
          {
              "key": "Heating & Cooling",
              "value": [
                  "Cooling: Ceiling Fan(s), Central, Heat Pump",
                  "Heating: Central, Natural Gas",
                  "Cooling: Ceiling Fan(s), Central"
              ]
          },
          {
              "key": "Kitchen Features",
              "value": [
                  "Uncovered Deck"
              ]
          },
          {
              "key": "2nd Unit Rents for",
              "value": [
                  "$.00"
              ]
          },
          {
              "key": "Home Warranty",
              "value": [
                  "false"
              ]
          },
          {
              "key": "Unit 2 Full Baths",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Interior Features",
              "value": [
                  "Laundry Features: Inside Area, Inside Room",
                  "Appliances: Free Standing Refrigerator, Dishwasher, Other",
                  "Patio And Porch Features: Uncovered Deck",
                  "Flooring: Carpet, Laminate, Linoleum/Vinyl",
                  "Patio And Porch Features: Porch",
                  "Window Features: Dual Pane Full, Window Screens",
                  "Appliances: Built-In Electric Oven, Built-In Gas Range, Dishwasher, Disposal, See Remarks",
                  "Flooring: Carpet, Laminate, Other",
                  "Interior Features: Skylight(s)"
              ]
          },
          {
              "key": "Total Parking Spaces",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Room Information",
              "replace": "true",
              "value": [
                  "Living Room Features: Skylight(s)",
                  "Dining Room Features: Breakfast Nook, Formal Area, Formal Room",
                  "Kitchen Features: Breakfast Area, Pantry Closet, Laminate Counter"
              ]
          },
          {
              "key": "Property Condition",
              "value": [
                  "Updated/Remodeled"
              ]
          },
          {
              "key": "# of Fireplaces",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Berth Size Width",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "City",
              "value": [
                  "Folsom"
              ]
          },
          {
              "key": "Unit 3 Bedrooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Possible Bedrooms",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "Redfin Estimate (Price)",
              "value": [
                  "$148,255"
              ]
          },
          {
              "key": "Dining Room Features",
              "value": [
                  "Formal Room",
                  "Breakfast Nook",
                  "Formal Area"
              ]
          },
          {
              "key": "PropertyUseGroup",
              "value": [
                  "Residential"
              ]
          },
          {
              "key": "Rent Includes",
              "value": [
                  "Water",
                  "Trash Collections"
              ]
          },
          {
              "key": "Postal Code (95630) Transport Description",
              "value": [
                  "This area is car dependent \u2014 almost all errands require a car. There is some amount of infrastructure for biking."
              ]
          },
          {
              "key": "Kitchen",
              "value": [
                  "Breakfast Bar",
                  "Countertop - Laminate",
                  "220 Volt Outlet"
              ]
          },
          {
              "key": "Mobile Home Information",
              "value": [
                  "Wood",
                  "Make: Bendix",
                  "Make: Bendix Manor"
              ]
          },
          {
              "key": "State",
              "value": [
                  "CA"
              ]
          },
          {
              "key": "# of 2 Bedroom Units",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Unit 2 Partial Baths",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Unit 2 Approx SqFt",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "Community Information",
              "value": [
                  "Senior Community YN: Yes"
              ]
          },
          {
              "key": "HVACHeatingDetail",
              "value": [
                  "NONE"
              ]
          },
          {
              "key": "Half Bathrooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "2 Bedroom Annual Occupancy",
              "value": [
                  ".00%"
              ]
          },
          {
              "key": "Days on Site",
              "replace": "true",
              "value": [
                  "88"
              ]
          },
          {
              "key": "Unit 1 Approx SqFt",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "3 Bedroom Annual Occupancy",
              "value": [
                  ".00%"
              ]
          },
          {
              "key": "2nd Unit Bedrooms",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "Horse Property",
              "value": [
                  "false"
              ]
          },
          {
              "key": "# of 3 Bedrooms Occupied",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Area/District",
              "value": [
                  "10630"
              ]
          },
          {
              "key": "Living Room Features",
              "value": [
                  "Skylight(s)"
              ]
          },
          {
              "key": "Unit 4 Rent",
              "value": [
                  "$.00"
              ]
          },
          {
              "key": "MLS Type",
              "value": [
                  "Manufactured In Park / Double Wide"
              ]
          },
          {
              "key": "Property Information",
              "value": [
                  "Property Condition: Updated/Remodeled",
                  "Year Built: 1,979",
                  "Property Sub Type: Double Wide",
                  "Year Built: 1,978",
                  "Property Type: Manufactured In Park"
              ]
          },
          {
              "key": "Unit 1 Serial #",
              "value": [
                  "RD1423A"
              ]
          },
          {
              "key": "Full Bathrooms",
              "value": [
                  "2"
              ]
          },
          {
              "key": "Unit 3 Full Baths",
              "value": [
                  "0"
              ]
          },
          {
              "key": "County",
              "value": [
                  "Sacramento"
              ]
          },
          {
              "key": "Senior Community",
              "value": [
                  "true"
              ]
          },
          {
              "key": "Roof",
              "value": [
                  "Other"
              ]
          },
          {
              "key": "Unit 2 # of Rooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Water Source",
              "value": [
                  "Public"
              ]
          },
          {
              "key": "Year Built Source",
              "value": [
                  "Assessor Auto-Fill"
              ]
          },
          {
              "key": "# of Studio Units",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Elementary School District",
              "value": [
                  "Folsom-Cordova"
              ]
          },
          {
              "key": "Unit 1 Bedrooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Dining Room",
              "value": [
                  "Breakfast Nook",
                  "Formal Area",
                  "Formal Dining Room"
              ]
          },
          {
              "key": "# Of Buildings",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Patio And Porch Features",
              "value": [
                  "Uncovered Deck"
              ]
          },
          {
              "key": "School District (County)",
              "value": [
                  "Sacramento"
              ]
          },
          {
              "key": "Unit 2 HCD/HUD Decal",
              "value": [
                  "Pinebrook"
              ]
          },
          {
              "key": "# of Rooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Parking Features",
              "value": [
                  "Covered"
              ]
          },
          {
              "key": "Electric",
              "value": [
                  "220 Volts in Laundry",
                  "220 Volts in Kitchen"
              ]
          },
          {
              "key": "xome.com Saves",
              "replace": "true",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Studio Annual Occupancy",
              "value": [
                  ".00%"
              ]
          },
          {
              "key": "Unit 4 Bedrooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Virtual Media Count",
              "value": [
                  "1"
              ]
          },
          {
              "key": "mls_listingAgents_key_1",
              "value": [
                  "1344828"
              ]
          },
          {
              "key": "xome.com Views",
              "replace": "true",
              "value": [
                  "20"
              ]
          },
          {
              "key": "Window Features",
              "value": [
                  "Dual Pane Full",
                  "Window Screens"
              ]
          },
          {
              "key": "Senior High School District",
              "value": [
                  "Folsom-Cordova"
              ]
          },
          {
              "key": "Unit 4 Full Baths",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Unit 4 # of Rooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Nearby Similar Homes",
              "value": [
                  "87 Olga Way, Roseville, CA 95661",
                  "77220 Lauppe Ln, Citrus Heights, CA 95621",
                  "6220 Stagecoach Dr, Sacramento, CA 95842",
                  "14 Chabot Dr, Citrus Heights, CA 95621",
                  "8354 Big Oak Dr, Citrus Heights, CA 95610",
                  "8004 Oakside Ln, Citrus Heights, CA 95610",
                  "8880 Auburn Folsom Rd #41, Granite Bay, CA 95746",
                  "7998 Cherry Blossom Ln, Citrus Heights, CA 95610",
                  "520 Southwood Dr, Folsom, CA 95630"
              ]
          },
          {
              "key": "Bathrooms",
              "value": [
                  "Stall Shower(s)",
                  "2.0"
              ]
          },
          {
              "key": "License Fee",
              "value": [
                  "$.00"
              ]
          },
          {
              "key": "Redfin Open House Time",
              "replace": "true",
              "value": [
                  "November 29, 2024, 6:00 PM - 8:00 PM"
              ]
          },
          {
              "key": "mlsID",
              "value": [
                  "MetroList Services of CA"
              ]
          },
          {
              "key": "Minimum Bldg SqFt",
              "value": [
                  "0.0"
              ]
          }
      ],
      "floorSizeUnit": "sq ft",
      "floorSizeValue": 1440,
      "geoLocation": "POINT (-121.175613 38.708924)",
      "id": "AW8sTFPY0x_BgD4emJh0",
      "imageURLs": [
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_1_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_2_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_3_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_4_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_5_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_6_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_7_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_8_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_9_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_10_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_11_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_12_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_13_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_14_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_15_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_16_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_17_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_18_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_19_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_20_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_21_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_22_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_23_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_24_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_25_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_26_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_27_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_28_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_29_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_30_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_31_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_32_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_33_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_34_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_35_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_36_1.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/949/genMid.224104949_37_1.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/8b4c42ce-d1a2-48c6-9b13-9259d07cde65.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/5cf1f8b8-dcbd-4aa9-ae4d-9a56b72b887e.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/ae001437-4a18-4f9e-a489-cefc5e2b6cd0.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/28bbb8fe-ef5f-4400-a102-da1839b1fcb9.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/02eb1d26-0bac-4493-9bf8-a90d7461103b.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/da818524-d4b8-4ab6-8efd-41eee59840a4.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/6f35c6ed-b889-4f5c-9188-d6ea4b786fe1.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/b09c0632-4af4-4af1-a532-a4ddb55e2e38.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/ce9a582b-be83-4750-a070-449f7ceedf1a.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/b74b6c30-e064-45e8-ad4a-735d7f20eac3.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/2da9ca55-202e-40de-b459-28a6e45c7172.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/db751d20-cb93-464c-8af5-5a2af8d31913.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/9b25ecce-e608-41d1-82ec-be8878e7c7b9.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/b43be98f-3731-4e12-b9ba-174771717ed6.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/90fdc35f-020f-4d47-9d1c-223cb82df944.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/85d0e011-d6ea-4d65-b56a-978c7bf08296.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/35fafb25-37ad-4284-84da-ed51c9d215ee.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/692ad0fd-1c89-4f1a-b66a-01878af77442.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/c8bfe461-5b62-44b9-87c1-0ca96a60692e.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/d6141241-c0f2-451e-9b6d-f6441df4c6ad.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/6f215f0c-3684-4745-ae6d-c3ef4fb536eb.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/90be587b-1f85-45f6-b793-cf61a77bdbbf.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/f1173de2-14c4-4994-832d-a66e93e2887b.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/570c1baa-0ea8-49e9-9ec9-68496ac9d614.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/e59ef4ee-634c-4f58-bd60-9a1ca6876e8e.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/8b09c0ca-b2a9-4290-b3d4-0c3647e31373.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/107bc0b8-db2e-4ff5-bf32-4a842cc1a9dd.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/1556d8f5-021d-44ab-bd66-d66a965d3f09.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/db025e60-479b-4dbf-9eff-c43d745443be.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/9cf2b93f-68e8-4027-b87e-0fefa555553e.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/7faa184f-5084-446f-9ae0-fc05e9dd3cb8.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/caf8b7a8-caa8-491d-8c72-d7f6caf06e32.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/0345cf7d-9073-4cba-85c6-6a2fc8b91176.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/898a7c11-471b-4fb8-931c-bd58b73fa56c.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/cd3ad61f-df53-4e4a-a53b-238cb2beb07e.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/eb2ac648-3a08-419f-886c-d7f370568b49.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/78d03256-1b2f-4b92-baa8-50d851d1b509.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/18/f774bfb3-b212-446a-9701-c4a2d2ac88a8.jpg",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/images/0/0/224104949.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-1.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-2.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-3.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-4.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-5.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-6.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-7.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-8.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-9.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-10.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-11.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-12.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-13.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-14.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-15.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-16.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-17.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-18.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-19.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-20.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-21.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-22.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-23.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-24.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-25.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-26.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-27.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-28.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-29.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-30.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-31.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-32.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-33.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-34.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-35.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-36.jpg?cd=63871975260",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224104949-37.jpg?cd=63871975260",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_0_739d1/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_1_46248/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_2_a16e1/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_3_1922f/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_4_68146/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_5_76a4b/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_6_af737/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_7_7b380/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_8_d2aed/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_9_57db1/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_10_5362a/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_11_9fd96/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_12_fddfe/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_13_16b96/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_14_4a8d7/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_15_f3bd0/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_16_1ac8c/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_17_64477/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_18_31325/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_19_2522d/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_20_846e5/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_21_c22f3/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_22_06005/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_23_7b713/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_24_1bf83/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_25_9cf83/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_26_9975f/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_27_59e55/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_28_8cd7e/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_29_846c4/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_30_0e8be/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_31_769df/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_32_ee864/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_33_83721/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_34_22e39/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_35_36a5b/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_36_b20e8/origin.jpg",
          "https://www.compass.com/m/bfde5d0adcdfb772933c551f6b4efe90f358330b_img_37_4f99b/origin.jpg",
          "https://maps.googleapis.com/maps/api/streetview?channel=mb-pdp-publicrecord&location=201+Rockglen+Rd%2C+Folsom%2C+CA+95630&size=665x441&source=outdoor&client=gme-redfin&signature=PpKA2NDQBZ7SPiNDknwhf2QrVsI="
      ],
      "keys": [
          "us/ca/folsom/201rockglenrd"
      ],
      "latitude": "38.708924",
      "listingName": "201 Rockglen Road",
      "longitude": "-121.175613",
      "lotSizeUnit": "sq ft",
      "lotSizeValue": 0,
      "mlsNumber": "224104949",
      "mostRecentBrokerAgent": "Brian Martell",
      "mostRecentBrokerCompany": "M.o.r.e. Real Estate Group",
      "mostRecentBrokerDateSeen": "2025-01-17T00:11:49.304Z",
      "mostRecentBrokerEmails": [
          "brianmartell@kw.com"
      ],
      "mostRecentBrokerPhones": [
          "916-804-0908",
          "9168040908",
          "9163652282",
          "916-8040908"
      ],
      "mostRecentPriceAmount": 239000,
      "mostRecentPriceDate": "2024-10-27T00:00:00.000Z",
      "mostRecentPriceDomain": "www.mlslistings.com",
      "mostRecentPriceFirstDateSeen": "2025-01-12T09:44:00.689Z",
      "mostRecentPriceSourceURL": "https://www.redfin.com/CA/Folsom/201-Rockglen-Rd-95630/home/19086420",
      "mostRecentStatus": "For Sale",
      "mostRecentStatusDate": "2024-10-18T07:00:00.000Z",
      "mostRecentStatusFirstDateSeen": "2025-01-12T02:08:52.425Z",
      "neighborhoods": [
          "American River Canyon North",
          "California",
          "Shingle Springs"
      ],
      "numBathroom": 2,
      "numBedroom": 2,
      "parking": [
          "Parking Features: Covered"
      ],
      "people": [
          {
              "dateSeen": "2025-01-17T00:12:00.000Z",
              "name": "Brian Martell",
              "title": "Listing Agent"
          },
          {
              "dateSeen": "2024-11-28T23:02:26.222Z",
              "email": "brianmartell@kw.com",
              "name": "Brian Martell",
              "phone": "916-8040908",
              "title": "Listing Agent"
          }
      ],
      "postalCode": "95630",
      "prices": [
          {
              "amountMax": 249000,
              "amountMin": 249000,
              "currency": "USD",
              "date": "2024-10-21T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-28T23:43:40.376Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 172.92
          },
          {
              "amountMax": 239000,
              "amountMin": 239000,
              "currency": "USD",
              "date": "2024-10-27T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-14T19:55:45.937Z",
                  "2025-01-12T09:44:00.689Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 165.97
          },
          {
              "amountMax": 249000,
              "amountMin": 249000,
              "currency": "USD",
              "date": "2024-10-21T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-03T01:04:15.976Z",
                  "2024-12-31T15:28:39.358Z"
              ],
              "pricePerSquareFoot": 172.92
          },
          {
              "amountMax": 249000,
              "amountMin": 249000,
              "currency": "USD",
              "date": "2024-10-21T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-25T19:27:22.994Z"
              ],
              "pricePerSquareFoot": 172.92
          },
          {
              "amountMax": 249000,
              "amountMin": 249000,
              "currency": "USD",
              "date": "2024-10-21T00:00:00.000Z",
              "dateSeen": [
                  "2024-11-04T23:47:22.938Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 172.92
          },
          {
              "amountMax": 239000,
              "amountMin": 239000,
              "currency": "USD",
              "date": "2024-10-27T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-12T09:10:06.977Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 165.97
          },
          {
              "amountMax": 249000,
              "amountMin": 249000,
              "currency": "USD",
              "date": "2024-10-21T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-27T19:20:37.185Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 172.92
          },
          {
              "amountMax": 239000,
              "amountMin": 239000,
              "currency": "USD",
              "date": "2024-10-27T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-12T02:08:52.419Z"
              ],
              "pricePerSquareFoot": 165.97
          },
          {
              "amountMax": 249000,
              "amountMin": 249000,
              "currency": "USD",
              "date": "2024-10-21T00:00:00.000Z",
              "dateSeen": [
                  "2024-10-31T02:18:05.113Z"
              ],
              "isSale": "true",
              "isSold": "false",
              "pricePerSquareFoot": 173
          },
          {
              "amountMax": 249000,
              "amountMin": 249000,
              "currency": "USD",
              "date": "2024-10-21T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-06T20:12:24.092Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 172.92
          },
          {
              "amountMax": 239000,
              "amountMin": 239000,
              "currency": "USD",
              "date": "2024-10-27T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-13T17:41:02.665Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 165.97
          },
          {
              "amountMax": 239000,
              "amountMin": 239000,
              "currency": "USD",
              "date": "2024-10-27T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-17T00:11:49.636Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 165.97
          },
          {
              "amountMax": 249000,
              "amountMin": 249000,
              "currency": "USD",
              "date": "2024-10-21T00:00:00.000Z",
              "dateSeen": [
                  "2024-11-22T17:19:07.578Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 172.92
          },
          {
              "amountMax": 249000,
              "amountMin": 249000,
              "currency": "USD",
              "date": "2024-10-21T00:00:00.000Z",
              "dateSeen": [
                  "2024-11-11T16:24:53.626Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 172.92
          }
      ],
      "propertyType": "Manufactured Home",
      "province": "CA",
      "sourceURLs": [
          "https://www.zillow.com/homedetails/201-Rockglen-Rd-Folsom-CA-95630/2106294965_zpid/",
          "https://www.xome.com/homes-for-sale/201-Rockglen-Road-Folsom-CA-95630-399502927",
          "https://www.redfin.com/CA/Folsom/201-Rockglen-Rd-95630/home/19086420",
          "https://www.remax.com/ca/folsom/home-details/201-rockglen-rd-folsom-ca-95630/7423855944622784770/M00000091/224104949",
          "https://datafiniti.co/mls",
          "https://datafiniti.co/",
          "https://www.mlslistings.com/property/me224104949/201-rockglen-road-folsom-ca-95630/16736102",
          "https://www.compass.com/listing/201-rockglen-road-folsom-ca-95630/1690082388201524865/"
      ],
      "statuses": [
          {
              "date": "2024-10-18T07:00:00.000Z",
              "dateSeen": [
                  "2025-01-14T19:55:45.943Z",
                  "2025-01-13T17:41:02.364Z",
                  "2025-01-12T09:10:06.684Z",
                  "2025-01-12T02:08:52.425Z",
                  "2025-01-12T09:44:00.393Z"
              ],
              "firstDateSeen": "2025-01-12T02:08:52.425Z",
              "lastDateSeen": "2025-01-14T19:55:45.943Z",
              "type": "For Sale"
          },
          {
              "dateSeen": [
                  "2019-12-22T02:24:00.000Z"
              ],
              "firstDateSeen": "2019-12-22T02:24:00.000Z",
              "lastDateSeen": "2019-12-22T02:24:00.000Z",
              "type": "Off Market"
          },
          {
              "date": "2021-02-26T00:00:00.000Z",
              "dateSeen": [
                  "2023-07-29T03:25:12.606Z"
              ],
              "firstDateSeen": "2023-07-29T03:25:12.606Z",
              "lastDateSeen": "2023-07-29T03:25:12.606Z",
              "type": "Sold"
          },
          {
              "date": "2023-10-11T00:00:00.000Z",
              "dateSeen": [
                  "2023-10-11T17:48:00.000Z",
                  "2023-10-11T01:12:00.000Z",
                  "2023-10-11T18:47:00.000Z"
              ],
              "firstDateSeen": "2023-10-11T01:12:00.000Z",
              "lastDateSeen": "2023-10-11T18:47:00.000Z",
              "type": "Off Market"
          },
          {
              "date": "2024-10-18T07:00:00.000Z",
              "dateSeen": [
                  "2025-01-17T00:11:49.295Z"
              ],
              "firstDateSeen": "2025-01-12T02:08:52.425Z",
              "lastDateSeen": "2025-01-17T00:11:49.295Z",
              "type": "For Sale"
          },
          {
              "date": "2024-10-18T07:00:00.000Z",
              "dateSeen": [
                  "2024-11-28T23:02:26.223Z"
              ],
              "firstDateSeen": "2024-11-28T23:02:26.223Z",
              "lastDateSeen": "2024-11-28T23:02:26.223Z",
              "type": "For Sale"
          },
          {
              "date": "2024-10-18T07:00:00.000Z",
              "dateSeen": [
                  "2024-12-10T02:43:26.988Z"
              ],
              "firstDateSeen": "2024-12-10T02:43:26.988Z",
              "lastDateSeen": "2024-12-10T02:43:26.988Z",
              "type": "For Sale"
          },
          {
              "date": "2021-02-26T00:00:00.000Z",
              "type": "Sold"
          }
      ],
      "transactions": [
          {
              "parcelNumber": "81000053100000",
              "saleDate": "2021-02-26T00:00:00.000Z"
          }
      ],
      "yearBuilt": 1978
  },
  {
      "address": "3983 Granite Pt Dr",
      "assessedValues": [
          {
              "totalAmount": 131019,
              "year": 2024
          }
      ],
      "brokers": [
          {
              "agent": "Eva Bukac, Nick Papageorgiou, Debbie Mccallion & S",
              "company": "Toll Brothers",
              "dateSeen": "2024-12-23T15:52:44.003Z"
          }
      ],
      "city": "Folsom",
      "country": "US",
      "dateAdded": "2024-12-21T02:57:23Z",
      "dateUpdated": "2025-01-17T13:36:07Z",
      "descriptions": [
          {
              "dateSeen": "2025-01-17T00:03:00.000Z",
              "value": "With an open-concept floor plan and expertly designed finishes, this move-in ready home is perfect for the way you live. The great room is perfect for bringing the outdoors inside with the 12x8-foot multi-slide door that opens to an oversized covered porch. Overlooking the great room and accompanied by a casual dining area, the stunning kitchen is the perfect environment for entertaining guests with wraparound counter space and a sprawling central island. As the centerpiece of the home, the open-concept great room is highlighted by gorgeous hardwood floors and convenient access to the covered outdoor patio. The home is complete with designer-curated finishes. Just minutes from everyday conveniences, this community is perfectly situated for your family's daily routine. Schedule an appointment today to learn more about this stunning home! Disclaimer: Photos are images only and should not be relied upon to confirm applicable features."
          }
      ],
      "domains": [
          "www.redfin.com",
          "www.trulia.com"
      ],
      "features": [
          {
              "key": "Listed",
              "replace": "true",
              "value": [
                  "5 days ago"
              ]
          },
          {
              "key": "See Virtual Tour",
              "value": [
                  "https://www.insidemaps.com/app/walkthrough-v2/?projectId=dTWQX5lisL&env=production&disableCookie=true"
              ]
          },
          {
              "key": "Property Type",
              "value": [
                  "Single Family Home"
              ]
          },
          {
              "key": "Listing Price Information",
              "value": [
                  "List Price: 1125995"
              ]
          },
          {
              "key": "Location Information",
              "value": [
                  "Address: 3983 Granite Point Dr, Folsom CA 95630"
              ]
          },
          {
              "key": "Property Information",
              "value": [
                  "Living Area: 3368"
              ]
          },
          {
              "key": "Listing Information",
              "value": [
                  "Modification Timestamp: 2025-01-09T17:20:52.346Z",
                  "Modification Timestamp: 2025-01-12T17:23:53.894Z",
                  "Modification Timestamp: 2024-12-20T08:02:20.860Z",
                  "Inventory Type: Spec",
                  "Modification Timestamp: 2025-01-07T20:01:41.396Z",
                  "Modification Timestamp: 2025-01-12T13:45:01.889Z",
                  "Modification Timestamp: 2024-12-29T01:12:26.443Z",
                  "Modification Timestamp: 2025-01-06T19:18:31.922Z",
                  "Modification Timestamp: 2025-01-01T06:55:29.239Z",
                  "Modification Timestamp: 2024-12-30T23:51:18.156Z",
                  "Modification Timestamp: 2025-01-02T19:31:44.654Z",
                  "Modification Timestamp: 2024-12-25T13:45:48.328Z",
                  "Modification Timestamp: 2024-12-29T16:09:41.326Z",
                  "Modification Timestamp: 2025-01-11T07:46:13.400Z",
                  "Modification Timestamp: 2025-01-02T00:29:28.711Z",
                  "Modification Timestamp: 2025-01-13T19:27:06.854Z",
                  "Modification Timestamp: 2025-01-13T23:25:00.132Z",
                  "Modification Timestamp: 2024-12-24T21:41:52.542Z",
                  "Modification Timestamp: 2025-01-02T00:19:02.293Z",
                  "Modification Timestamp: 2024-12-24T06:31:40.541Z",
                  "Standard Status: Active",
                  "Modification Timestamp: 2025-01-14T09:28:45.730Z",
                  "Modification Timestamp: 2024-12-25T18:26:22.022Z",
                  "Modification Timestamp: 2025-01-16T16:38:00.836Z",
                  "Modification Timestamp: 2024-12-27T09:14:51.577Z",
                  "Modification Timestamp: 2024-12-28T07:54:58.659Z",
                  "Plan Name: Inca",
                  "Modification Timestamp: 2025-01-13T07:15:26.928Z",
                  "Modification Timestamp: 2024-12-21T18:52:43.051Z",
                  "Modification Timestamp: 2024-12-20T21:48:12.185Z"
              ]
          },
          {
              "key": "Price/Sqft",
              "value": [
                  "$334"
              ]
          },
          {
              "key": "HOA",
              "value": [
                  "None"
              ]
          },
          {
              "key": "Bedroom Information",
              "value": [
                  "# of Bedrooms Total: 5"
              ]
          }
      ],
      "floorSizeUnit": "sq ft",
      "floorSizeValue": 3368,
      "geoLocation": "POINT (-121.132981 38.621765)",
      "id": "TaAl55MBoOD0_HX28lgX",
      "imageURLs": [
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/3B4/genMid.BB0D209283B4_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/3B4/genMid.BB0D209283B4_1_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/3B4/genMid.BB0D209283B4_2_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/3B4/genMid.BB0D209283B4_3_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/3B4/genMid.BB0D209283B4_4_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/3B4/genMid.BB0D209283B4_5_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/3B4/genMid.BB0D209283B4_6_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/3B4/genMid.BB0D209283B4_7_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/3B4/genMid.BB0D209283B4_8_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/3B4/genMid.BB0D209283B4_9_0.jpg",
          "https://ssl.cdn-redfin.com/photo/595/mbphotov2/3B4/genMid.BB0D209283B4_10_0.jpg"
      ],
      "keys": [
          "us/ca/folsom/3983graniteptdr"
      ],
      "latitude": "38.621765",
      "longitude": "-121.132981",
      "mlsNumber": "BB0D209283B4",
      "mostRecentBrokerAgent": "Eva Bukac, Nick Papageorgiou, Debbie Mccallion & S",
      "mostRecentBrokerCompany": "Toll Brothers",
      "mostRecentBrokerDateSeen": "2024-12-23T15:52:44.003Z",
      "mostRecentPriceAmount": 1125995,
      "mostRecentPriceDate": "2024-12-18T00:00:00.000Z",
      "mostRecentPriceDomain": "www.redfin.com",
      "mostRecentPriceFirstDateSeen": "2024-12-28T09:44:39.575Z",
      "mostRecentStatus": "For Sale",
      "mostRecentStatusDate": "2024-12-18T00:00:00.000Z",
      "mostRecentStatusFirstDateSeen": "2025-01-02T22:21:48.364Z",
      "numBathroom": 4.5,
      "numBedroom": 5,
      "numFloor": 2,
      "parking": [
          "Garage"
      ],
      "postalCode": "95630",
      "prices": [
          {
              "amountMax": 1125995,
              "amountMin": 1125995,
              "currency": "USD",
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-31T03:54:07.450Z",
                  "2025-01-14T00:28:03.780Z",
                  "2025-01-02T00:52:46.158Z",
                  "2025-01-01T12:10:35.237Z",
                  "2024-12-31T00:56:41.794Z",
                  "2025-01-14T14:53:07.996Z",
                  "2025-01-13T06:13:38.078Z",
                  "2024-12-30T01:19:59.704Z",
                  "2024-12-28T09:44:39.575Z",
                  "2025-01-13T14:34:40.232Z",
                  "2024-12-31T00:17:54.492Z",
                  "2024-12-29T08:28:38.910Z",
                  "2025-01-02T05:39:19.061Z",
                  "2024-12-31T04:09:32.267Z",
                  "2025-01-13T06:27:07.202Z",
                  "2024-12-28T14:13:08.798Z",
                  "2025-01-11T15:06:15.809Z",
                  "2025-01-01T11:33:10.084Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 334.32
          },
          {
              "amountMax": 1125995,
              "amountMin": 1125995,
              "currency": "USD",
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-09T22:14:31.370Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 334.32
          },
          {
              "amountMax": 1125995,
              "amountMin": 1125995,
              "currency": "USD",
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-06T23:27:01.690Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 334.32
          },
          {
              "amountMax": 1125995,
              "amountMin": 1125995,
              "currency": "USD",
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-09T18:35:12.775Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 334.32
          },
          {
              "amountMax": 1125995,
              "amountMin": 1125995,
              "currency": "USD",
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-24T14:17:55.420Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 334.32
          },
          {
              "amountMax": 1125995,
              "amountMin": 1125995,
              "currency": "USD",
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-12T22:40:36.681Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 334.32
          },
          {
              "amountMax": 1125995,
              "amountMin": 1125995,
              "currency": "USD",
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-27T18:46:09.398Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 334.32
          },
          {
              "amountMax": 1125995,
              "amountMin": 1125995,
              "currency": "USD",
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-22T16:30:12.394Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 334.32
          },
          {
              "amountMax": 1125995,
              "amountMin": 1125995,
              "currency": "USD",
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-07T23:36:54.485Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 334.32
          },
          {
              "amountMax": 1125995,
              "amountMin": 1125995,
              "currency": "USD",
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-12T17:03:53.567Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 334.32
          },
          {
              "amountMax": 1125995,
              "amountMin": 1125995,
              "currency": "USD",
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-25T19:28:21.594Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 334.32
          },
          {
              "amountMax": 1125995,
              "amountMin": 1125995,
              "currency": "USD",
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-13T23:23:12.454Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 334.32
          },
          {
              "amountMax": 1125995,
              "amountMin": 1125995,
              "currency": "USD",
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-13T21:02:07.528Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 334.32
          },
          {
              "amountMax": 1125995,
              "amountMin": 1125995,
              "currency": "USD",
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-17T00:02:53.222Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 334.32
          },
          {
              "amountMax": 1125995,
              "amountMin": 1125995,
              "currency": "USD",
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-02T22:21:48.677Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 334.32
          },
          {
              "amountMax": 1125995,
              "amountMin": 1125995,
              "currency": "USD",
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-25T17:58:27.070Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 334.32
          }
      ],
      "propertyType": "Single Family Dwelling",
      "province": "CA",
      "sourceURLs": [
          "https://www.redfin.com/CA/Folsom/3983-Granite-Pt-Dr-95630/home/186997248",
          "https://www.trulia.com/home/3983-granite-point-dr-folsom-ca-95630-339037106",
          "https://www.redfin.com/CA/Folsom/3983-Granite-Point-Dr-95630/home/186997248"
      ],
      "statuses": [
          {
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-13T06:27:06.900Z",
                  "2025-01-14T00:28:03.453Z",
                  "2025-01-13T14:34:39.926Z",
                  "2025-01-14T14:53:07.687Z",
                  "2025-01-11T15:06:15.475Z",
                  "2025-01-13T06:13:37.753Z",
                  "2025-01-02T22:21:48.364Z"
              ],
              "firstDateSeen": "2025-01-02T22:21:48.364Z",
              "lastDateSeen": "2025-01-14T14:53:07.687Z",
              "type": "For Sale"
          },
          {
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-17T00:02:52.890Z"
              ],
              "firstDateSeen": "2025-01-02T22:21:48.364Z",
              "lastDateSeen": "2025-01-17T00:02:52.890Z",
              "type": "For Sale"
          },
          {
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-02T00:52:45.861Z",
                  "2025-01-01T12:10:34.875Z",
                  "2025-01-02T05:39:18.726Z"
              ],
              "firstDateSeen": "2025-01-01T12:10:34.875Z",
              "lastDateSeen": "2025-01-02T05:39:18.726Z",
              "type": "For Sale"
          },
          {
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-26T07:24:28.171Z",
                  "2024-12-25T17:58:26.738Z"
              ],
              "firstDateSeen": "2024-12-25T17:58:26.738Z",
              "lastDateSeen": "2024-12-26T07:24:28.171Z",
              "type": "For Sale"
          },
          {
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-25T00:24:10.201Z",
                  "2024-12-25T02:22:43.997Z"
              ],
              "firstDateSeen": "2024-12-25T00:24:10.201Z",
              "lastDateSeen": "2024-12-25T02:22:43.997Z",
              "type": "For Sale"
          },
          {
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-06T23:27:01.379Z"
              ],
              "firstDateSeen": "2025-01-06T23:27:01.379Z",
              "lastDateSeen": "2025-01-06T23:27:01.379Z",
              "type": "For Sale"
          },
          {
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-12T17:03:53.234Z"
              ],
              "firstDateSeen": "2025-01-12T17:03:53.234Z",
              "lastDateSeen": "2025-01-12T17:03:53.234Z",
              "type": "For Sale"
          },
          {
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-09T22:14:31.046Z"
              ],
              "firstDateSeen": "2025-01-09T22:14:31.046Z",
              "lastDateSeen": "2025-01-09T22:14:31.046Z",
              "type": "For Sale"
          },
          {
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-07T23:36:54.183Z"
              ],
              "firstDateSeen": "2025-01-07T23:36:54.183Z",
              "lastDateSeen": "2025-01-07T23:36:54.183Z",
              "type": "For Sale"
          },
          {
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-13T21:02:07.211Z"
              ],
              "firstDateSeen": "2025-01-13T21:02:07.211Z",
              "lastDateSeen": "2025-01-13T21:02:07.211Z",
              "type": "For Sale"
          },
          {
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-21T04:25:40.081Z"
              ],
              "firstDateSeen": "2024-12-21T04:25:40.081Z",
              "lastDateSeen": "2024-12-21T04:25:40.081Z",
              "type": "For Sale"
          },
          {
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-12T22:40:36.350Z"
              ],
              "firstDateSeen": "2025-01-12T22:40:36.350Z",
              "lastDateSeen": "2025-01-12T22:40:36.350Z",
              "type": "For Sale"
          },
          {
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-09T18:35:12.464Z"
              ],
              "firstDateSeen": "2025-01-09T18:35:12.464Z",
              "lastDateSeen": "2025-01-09T18:35:12.464Z",
              "type": "For Sale"
          },
          {
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-25T19:28:21.287Z"
              ],
              "firstDateSeen": "2024-12-25T19:28:21.287Z",
              "lastDateSeen": "2024-12-25T19:28:21.287Z",
              "type": "For Sale"
          },
          {
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-13T23:23:12.137Z"
              ],
              "firstDateSeen": "2025-01-13T23:23:12.137Z",
              "lastDateSeen": "2025-01-13T23:23:12.137Z",
              "type": "For Sale"
          },
          {
              "date": "2024-12-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-23T15:52:44.003Z"
              ],
              "firstDateSeen": "2024-12-23T15:52:44.003Z",
              "isUnderContract": "false",
              "lastDateSeen": "2024-12-23T15:52:44.003Z",
              "type": "For Sale"
          }
      ],
      "yearBuilt": 2024
  },
  {
      "address": "108 Tyrell Ct",
      "assessedValues": [
          {
              "improvementsAmount": 247059,
              "landAmount": 92285,
              "totalAmount": 339344,
              "year": 2024
          },
          {
              "improvementsAmount": 242215,
              "landAmount": 90476,
              "totalAmount": 332691,
              "year": 2023
          }
      ],
      "brokers": [
          {
              "agent": "Shon Delia",
              "company": "Exp Realty Of California Inc.",
              "dateSeen": "2025-01-16T23:59:33.696Z",
              "licenseNumber": "DRE #01959294"
          },
          {
              "agent": "Shon R Delia",
              "company": "Exp Realty Of California Inc.",
              "dateSeen": "2024-11-26T04:55:00.000Z",
              "emails": [
                  "shon@deliahomes.com"
              ],
              "phones": [
                  "916-9323573"
              ]
          },
          {
              "agent": "Kevin Prokosch",
              "company": "Exp Realty Of California Inc.",
              "dateSeen": "2025-01-16T23:59:33.695Z",
              "emails": [
                  "kevin@deliahomes.com"
              ],
              "licenseNumber": "DRE #02071041",
              "phones": [
                  "916-7495610",
                  "9167495610"
              ]
          }
      ],
      "city": "Folsom",
      "country": "US",
      "county": "Sacramento",
      "countyFIPS": 6067,
      "dateAdded": "2019-12-19T20:14:12Z",
      "dateUpdated": "2025-01-17T13:28:22Z",
      "descriptions": [
          {
              "dateSeen": "2025-01-16T17:03:00.000Z",
              "value": "Welcome to this inviting single-story home in Folsom's sought-after Broadstone neighborhood! Offering 3 bedrooms, 2 full baths, and 1,352 sqft of living space, this home is full of potential. Recent updates include fresh paint, new carpet, new blinds, and a new water heater, making it move-in ready The spacious backyard is a blank canvas with room for a pool and an ADU (Accessory Dwelling Unit), offering endless possibilities for expansion or extra income. With RV parking possible, it's perfect for those who love adventure and need space for their vehicles. This home is ideally located near top-rated schools, beautiful parks, and the premier shopping and dining at the Palladio. For outdoor enthusiasts, Folsom Lake and local golf courses are just a short drive away. And with no HOA, you have more freedom to personalize your space. Don't miss your chance to make this home your own in one of Folsom's most desirable communities!"
          },
          {
              "dateSeen": "2021-12-22T21:31:00.000Z",
              "value": "What is the crime rate? The neighborhood surrounding 108 Tyrell Ct is relatively safe since the personal crime risk (including both violent and non-violent crimes) is 1.5%, which is lower than the state average of 11.8%. Property crime risk is 3.7%, which is lower than the state average of 10.8%."
          },
          {
              "dateSeen": "2021-12-22T21:31:00.000Z",
              "value": "Is there a risk of a natural disaster? 108 Tyrell Ct resides in an area with low flood risk, low tornado risk, and high earthquake risk."
          },
          {
              "dateSeen": "2021-12-22T21:31:00.000Z",
              "value": "108 Tyrell Ct is a single family home in Folsom, CA. This home was built in 1992 and includes three bedrooms, two bathrooms, and 1,352 square feet of living space. Additional features include a parking garage, fireplace, central heating system, and central cooling system. Today, the estimated home value is around 483,700. Frequently asked questions about 108 Tyrell Ct and the surrounding community."
          },
          {
              "dateSeen": "2021-12-22T21:31:00.000Z",
              "value": "What is the weather like year-round? The average temperature for 108 Tyrell Ct is about 43.7 degrees in January and 70.3 degrees in July. The average rainfall is around 46.0 inches per year. The average snowfall is around 0.3 inches per year."
          },
          {
              "dateSeen": "2025-01-17T00:00:00.000Z",
              "value": "Welcome to this inviting single-story home in Folsom's sought-after Broadstone neighborhood! Offering 3 bedrooms, 2 full baths, and 1,352 sqft of living space, this home is full of potential. Recent updates include fresh paint, new carpet, new blinds, and a new water heater, making it move-in ready. The spacious backyard is a blank canvas with room for a pool and an ADU (Accessory Dwelling Unit), offering endless possibilities for expansion or extra income. With RV parking possible, it's perfect for those who love adventure and need space for their vehicles. This home is ideally located near top-rated schools, beautiful parks, and the premier shopping and dining at the Palladio. For outdoor enthusiasts, Folsom Lake and local golf courses are just a short drive away. And with no HOA, you have more freedom to personalize your space. Don't miss your chance to make this home your own in one of Folsom's most desirable communities!"
          },
          {
              "dateSeen": "2021-12-22T21:31:00.000Z",
              "value": "How is the neighborhood? 108 Tyrell Ct is located in a community that is home to 44,758 residents, which has increased by 30% since 2000. 73% of the residents are families with children. The largest age group is between 35 to 44 (17.81%), while the second-largest age group is between 45 to 54 (16.58%)."
          },
          {
              "dateSeen": "2021-12-22T21:31:00.000Z",
              "value": "How\u2019s the job market? About 69.7% of the residents near 108 Tyrell Ct have white-collar jobs, while the remaining 30.4% have blue-collar jobs. The unemployment rate is about 3.0%, which is lower than the state unemployment rate of 4.7%."
          },
          {
              "dateSeen": "2021-12-22T21:31:00.000Z",
              "value": "What is the cost of living? The average family living near 108 Tyrell Ct has a median household income of $98,911 and spends about $68,896 annually."
          },
          {
              "dateSeen": "2021-12-22T21:31:00.000Z",
              "value": "How are the schools? The schools closest to 108 Tyrell Ct include Gold Ridge Elementary, Folsom Middle, and Folsom High. The average SAT score for this area is about 1034 (526 for Math and 508 for English), which is higher than the state average SAT score of 975."
          }
      ],
      "domains": [
          "assessorparcelviewer.saccounty.gov",
          "homefinder.com",
          "www.compass.com",
          "www.redfin.com",
          "datafiniti.co",
          "www.remax.com",
          "www.xome.com",
          "www.mlslistings.com"
      ],
      "features": [
          {
              "key": "Water",
              "value": [
                  "Public"
              ]
          },
          {
              "key": "Laundry Features",
              "value": [
                  "Laundry Closet",
                  "Electric",
                  "Cabinets",
                  "Hookups Only"
              ]
          },
          {
              "key": "Unit 1 Rent",
              "value": [
                  "$.00"
              ]
          },
          {
              "key": "# of Guest Space(s)",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Compass Type",
              "value": [
                  "Single Family"
              ]
          },
          {
              "key": "mls_newConstruction",
              "value": [
                  "false"
              ]
          },
          {
              "key": "Garage/Parking",
              "value": [
                  "Facing Front",
                  "RV Possible",
                  "Gate/Door Opener",
                  "Garage: 2 Car(s)",
                  "Attached Garage"
              ]
          },
          {
              "key": "Unit 1 Partial Baths",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Flooring",
              "value": [
                  "Laminate",
                  "Linoleum",
                  "Carpet"
              ]
          },
          {
              "key": "Fireplace Features",
              "value": [
                  "Brick",
                  "Family Room",
                  "Wood Burning"
              ]
          },
          {
              "key": "Foundation",
              "value": [
                  "Concrete Perimeter and Slab",
                  "Slab"
              ]
          },
          {
              "key": "Pool",
              "value": [
                  "Pool - No",
                  "false"
              ]
          },
          {
              "key": "Construction",
              "value": [
                  "Wood Frame"
              ]
          },
          {
              "key": "Date updated",
              "value": [
                  "03/27/2020"
              ]
          },
          {
              "key": "Cooling",
              "value": [
                  "CENTRAL",
                  "Central"
              ]
          },
          {
              "key": "Unit 1 # of Rooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Lot Features",
              "value": [
                  "Landscape Front",
                  "Landscape Misc",
                  "Street Lights",
                  "Curb(s)/Gutter(s)",
                  "Shape Irregular",
                  "Manual Sprinkler F&R",
                  "Court"
              ]
          },
          {
              "key": "Road Responsibility",
              "value": [
                  "Public Maintained Road"
              ]
          },
          {
              "key": "Pool Information",
              "value": [
                  "Has Private Pool: No",
                  "Has Spa: No"
              ]
          },
          {
              "key": "Lot Information",
              "value": [
                  "Legal Lot Number: 17",
                  "Lot Size Acres: 0.1874",
                  "Lot Size Square Feet: 8,163",
                  "Land Sq. Ft: 8,165",
                  "# of Buildings: 1",
                  "Land Use Code: Sfr",
                  "County Use Description: 1 FAMILY RESIDENTIAL",
                  "Zoning Code: R-1-M",
                  "Acres: 0.1874",
                  "Lot Features: Manual Sprinkler F&R, Court, Curb(s)/Gutter(s), Shape Irregular, Landscape Front, Landscape Misc",
                  "Municipality Name: FOLSOM, CITY OF"
              ]
          },
          {
              "key": "Amenities",
              "value": [
                  "Private Outdoor Space",
                  "Garage",
                  "Parking Included",
                  "Air Conditioning",
                  "RV Parking"
              ]
          },
          {
              "key": "Green Verification Year",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Open Parking Spaces",
              "value": [
                  "2"
              ]
          },
          {
              "key": "Picture Count",
              "value": [
                  "33"
              ]
          },
          {
              "key": "# of Lots",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Photos Provided By",
              "value": [
                  "3rd Party Photographer"
              ]
          },
          {
              "key": "# of 4 Bedroom Units",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Entry Level",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Association",
              "value": [
                  "false"
              ]
          },
          {
              "key": "# of 3 Bedroom Units",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Redfin Rental Estimate",
              "replace": "true",
              "value": [
                  "$2743 - $2783 / month"
              ]
          },
          {
              "key": "Driveway/Sidewalks",
              "value": [
                  "Paved Driveway"
              ]
          },
          {
              "key": "Median Homeowner Age",
              "value": [
                  "34.0"
              ]
          },
          {
              "key": "Tandem Parking Spaces",
              "value": [
                  "0"
              ]
          },
          {
              "key": "MLS Source",
              "value": [
                  "MetroList Services, Inc."
              ]
          },
          {
              "key": "Exterior Features",
              "value": [
                  "Allows Horses: No",
                  "Roof: Cement, Tile",
                  "Fencing: Wood, Masonry"
              ]
          },
          {
              "key": "Bath Features",
              "value": [
                  "Window",
                  "Tile",
                  "Tub w/Shower Over",
                  "Granite"
              ]
          },
          {
              "key": "Parking",
              "value": [
                  "Type Not Specified"
              ]
          },
          {
              "key": "Zoning",
              "value": [
                  "R-1-M"
              ]
          },
          {
              "key": "Assessor Information",
              "value": [
                  "Tax Area: FOLSOM, CITY OF",
                  "Assessment Year: 2019"
              ]
          },
          {
              "key": "Carport Spaces",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Unit 3 Rent",
              "value": [
                  "$.00"
              ]
          },
          {
              "key": "City Transfer Tax Rate",
              "value": [
                  ".00%"
              ]
          },
          {
              "key": "Length",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "2nd Unit Approx SqFt",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "Location Information",
              "value": [
                  "State Or Province: CA",
                  "Street Address Filtered: 108 Tyrell Ct",
                  "County Or Parish: Sacramento",
                  "CrossStreet: Kennerly Way",
                  "Postal Code: 95630",
                  "Subdivision Name: Broadstone",
                  "Unparsed Address: 108 Tyrell Ct, Folsom, CA 95630-8604",
                  "Postal Code Plus 4: 8604",
                  "Directions: Start on US-50. Take exit onto Prairie City Road. Turn left onto Prairie City Road. Turn right onto Iron Point Road. Turn left onto Oak Avenue Parkway. Turn right onto Kennerly Way. Turn left onto Tyrell Court. Destination is on the right!",
                  "Street Number Numeric: 108"
              ]
          },
          {
              "key": "Family Room",
              "value": [
                  "Other"
              ]
          },
          {
              "key": "Land Lease",
              "value": [
                  "false"
              ]
          },
          {
              "key": "# Studios Occupied",
              "value": [
                  "0"
              ]
          },
          {
              "key": "# of Floors",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Postal Code (95630) Real Estate Sales (Last 30 Days)",
              "value": [
                  "Avg. # Offers: 1",
                  "# Sold Homes: 68",
                  "Median List Price: $591K",
                  "Median $ / Sq. Ft.: $282",
                  "Avg. Down Payment: 28.3%",
                  "Median Sale / List: 99.3%"
              ]
          },
          {
              "key": "Parking Fee $",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "Berth Size Length",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "Unit 3 Approx SqFt",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "Zip Plus 4",
              "value": [
                  "8604"
              ]
          },
          {
              "key": "2nd Unit Rents for",
              "value": [
                  "$.00"
              ]
          },
          {
              "key": "Home Warranty",
              "value": [
                  "false"
              ]
          },
          {
              "key": "Unit 2 Full Baths",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Interior Features",
              "value": [
                  "Flooring: Carpet, Laminate, Linoleum",
                  "Appliances: Dishwasher, Disposal, Microwave, Free Standing Electric Range",
                  "# of Stories: 1",
                  "Fireplace Features: Brick, Family Room, Wood Burning",
                  "Fireplaces Total: 1",
                  "Window Features: Dual Pane Full, Window Coverings, Window Screens",
                  "Patio And Porch Features: Front Porch",
                  "Laundry Features: Cabinets, Laundry Closet, Electric, Hookups Only"
              ]
          },
          {
              "key": "Total Parking Spaces",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Tax Record",
              "value": [
                  "2018: $3,640"
              ]
          },
          {
              "key": "Property Condition",
              "value": [
                  "Original"
              ]
          },
          {
              "key": "Year renovated",
              "value": [
                  "1992"
              ]
          },
          {
              "key": "Redfin Estimate (Price)",
              "value": [
                  "$461,628"
              ]
          },
          {
              "key": "architecturalFeatures",
              "value": [
                  "hasFireplace"
              ]
          },
          {
              "key": "Postal Code (95630) Transport Description",
              "value": [
                  "This area is car dependent \u2014 most errands require a car. There is some amount of infrastructure for biking."
              ]
          },
          {
              "key": "Kitchen",
              "value": [
                  "Countertop - Tile",
                  "Breakfast Bar",
                  "Breakfast Nook",
                  "Pantry Cabinet"
              ]
          },
          {
              "key": "State",
              "value": [
                  "CA"
              ]
          },
          {
              "key": "Price History - Redfin",
              "replace": "true",
              "value": [
                  "Date: 1/20/1995 - Price: $137500 - Event: Sold (Public Records)",
                  "Date: 10/25/1994 - Price: $142000 - Event: Sold (Public Records)",
                  "Date: 7/9/2002 - Price: $239000 - Event: Sold (Public Records)"
              ]
          },
          {
              "key": "# of 2 Bedroom Units",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Community Information",
              "value": [
                  "Senior Community YN: No"
              ]
          },
          {
              "key": "Days on Site",
              "replace": "true",
              "value": [
                  "89"
              ]
          },
          {
              "key": "Unit 1 Approx SqFt",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "3 Bedroom Annual Occupancy",
              "value": [
                  ".00%"
              ]
          },
          {
              "key": "Area/District",
              "value": [
                  "10630"
              ]
          },
          {
              "key": "Unit 4 Rent",
              "value": [
                  "$.00"
              ]
          },
          {
              "key": "Property Information",
              "value": [
                  "Property Type: Residential",
                  "Year Built: 1,992",
                  "Legal Description: BROADSTONE 01A, LOT 17",
                  "Property Sub Type: Single Family Residence",
                  "Stories Type: 1",
                  "Subtype Description: Detached",
                  "Property Condition: Original",
                  "Living Sq. Ft: 1,352",
                  "# of Stories: 1",
                  "Ground Floor Sq. Ft: 1,352",
                  "Subdivision Name: BROADSTONE 01A"
              ]
          },
          {
              "key": "Full Bathrooms",
              "value": [
                  "2"
              ]
          },
          {
              "key": "Exterior Information",
              "value": [
                  "Phyiscal Condition: Average",
                  "Construction Type: Wood",
                  "Building Construction Quality: Average",
                  "Building Style Type: L-Shape",
                  "Floor Construction Type: Concrete",
                  "Foundation Type: Slab"
              ]
          },
          {
              "key": "Senior Community",
              "value": [
                  "false"
              ]
          },
          {
              "key": "Roof",
              "value": [
                  "Cement",
                  "Tile",
                  "Concrete"
              ]
          },
          {
              "key": "Unit 2 # of Rooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Water Source",
              "value": [
                  "Public"
              ]
          },
          {
              "key": "Elementary School District",
              "value": [
                  "Folsom-Cordova"
              ]
          },
          {
              "key": "Unit 1 Bedrooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "House size",
              "value": [
                  "1,352 sq ft"
              ]
          },
          {
              "key": "New Construction",
              "value": [
                  "No"
              ]
          },
          {
              "key": "School District (County)",
              "value": [
                  "Sacramento"
              ]
          },
          {
              "key": "# of Rooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Studio Annual Occupancy",
              "value": [
                  ".00%"
              ]
          },
          {
              "key": "Unit 4 Bedrooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Unit 4 Full Baths",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Unit 4 # of Rooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Remodeled/Updated",
              "value": [
                  "No"
              ]
          },
          {
              "key": "Redfin Open House Time",
              "replace": "true",
              "value": [
                  "January 18, 2025, 8:00 PM - 12:00 AM",
                  "January 19, 2025, 8:00 PM - 11:00 PM"
              ]
          },
          {
              "key": "mlsID",
              "value": [
                  "MetroList",
                  "MetroList Services of CA"
              ]
          },
          {
              "key": "Minimum Bldg SqFt",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "Fencing",
              "value": [
                  "Wood",
                  "Masonry"
              ]
          },
          {
              "key": "Mortgage Estimate",
              "value": [
                  "Monthly Total: $937"
              ]
          },
          {
              "key": "4 Bedroom Annual Occupancy",
              "value": [
                  ".00%"
              ]
          },
          {
              "key": "Property Faces",
              "value": [
                  "Southeast"
              ]
          },
          {
              "key": "Area Short Display",
              "value": [
                  "10630"
              ]
          },
          {
              "key": "taxes",
              "value": [
                  "2023 - $3838.12"
              ]
          },
          {
              "key": "Virtual Tour URL",
              "value": [
                  "https://vimeo.com/1020458801"
              ]
          },
          {
              "key": "Graduate Degree Percentile",
              "value": [
                  "8.6%"
              ]
          },
          {
              "key": "Days on Compass",
              "replace": "true",
              "value": [
                  "39"
              ]
          },
          {
              "key": "Elevation",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Room Type",
              "value": [
                  "Master Bedroom",
                  "Kitchen",
                  "Master Bathroom",
                  "Family Room"
              ]
          },
          {
              "key": "Unit 2 Rent",
              "value": [
                  "$.00"
              ]
          },
          {
              "key": "Main Level",
              "value": [
                  "Bedroom(s)",
                  "Master Bedroom",
                  "Garage",
                  "Kitchen",
                  "Street Entrance",
                  "Full Bath(s)",
                  "Family Room"
              ]
          },
          {
              "key": "# of 1 Bedroom Units",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Postal Code (95630) Transport Scores",
              "value": [
                  "Walking Score: 30/100 - Car-Dependent",
                  "Transit Score: 60/100 - Bikeable"
              ]
          },
          {
              "key": "Primary Bedroom Features",
              "value": [
                  "Closet",
                  "Outside Access"
              ]
          },
          {
              "key": "Unemployment Rate",
              "value": [
                  "3.0%"
              ]
          },
          {
              "key": "Similar Homes For Sale",
              "value": [
                  "https://www.realtor.com/realestateandhomes-detail/821-Fratis-St_Folsom_CA_95630_M14217-75179",
                  "https://www.realtor.com/realestateandhomes-detail/907-Rathbone-Cir_Folsom_CA_95630_M12420-52910",
                  "https://www.realtor.com/realestateandhomes-detail/109-Casselman-St_Folsom_CA_95630_M21509-43355",
                  "https://www.realtor.com/realestateandhomes-detail/1438-Taupin-Ct_Folsom_CA_95630_M28289-11274",
                  "https://www.realtor.com/realestateandhomes-detail/855-Nichols-Cir_Folsom_CA_95630_M24975-79779",
                  "https://www.realtor.com/realestateandhomes-detail/115-Northolt-Ct_Folsom_CA_95630_M28514-68541",
                  "https://www.realtor.com/realestateandhomes-detail/2307-Clapton-Way_Folsom_CA_95630_M12821-13799",
                  "https://www.realtor.com/realestateandhomes-detail/454-Rosegold-Pl_Folsom_CA_95630_M27091-87173",
                  "https://www.realtor.com/realestateandhomes-detail/748-Halidon-Way_Folsom_CA_95630_M25345-47594",
                  "https://www.realtor.com/realestateandhomes-detail/1213-Newmark-Way_Folsom_CA_95630_M12838-28032",
                  "https://www.realtor.com/realestateandhomes-detail/700-Loomis-Cir_Folsom_CA_95630_M23527-59986",
                  "https://www.realtor.com/realestateandhomes-detail/135-Lembi-Dr_Folsom_CA_95630_M26994-60762"
              ]
          },
          {
              "key": "Unit 3 Partial Baths",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Redfin Virtual Tour",
              "replace": "true",
              "value": [
                  "https://vimeo.com/1020458801"
              ]
          },
          {
              "key": "Independent Parking Spaces",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Unit 1 Full Baths",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Nearby Recently Sold Homes",
              "value": [
                  "108 Wellfleet Crk, Folsom, CA 95630",
                  "109 Paine Ct, Folsom, CA 95630",
                  "141 Camberwell Way, Folsom, CA 95630"
              ]
          },
          {
              "key": "# of 2 Bedrooms Occupied",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Lot",
              "value": [
                  "17"
              ]
          },
          {
              "key": "Nearby Home Values",
              "value": [
                  "https://www.realtor.com/realestateandhomes-detail/103-Harcourt-Way_Folsom_CA_95630_M17874-77245",
                  "https://www.realtor.com/realestateandhomes-detail/103-Grantham-Ct_Folsom_CA_95630_M10317-98463",
                  "https://www.realtor.com/realestateandhomes-detail/113-Harcourt-Way_Folsom_CA_95630_M28902-25122",
                  "https://www.realtor.com/realestateandhomes-detail/109-Pascoe-Ct_Folsom_CA_95630_M28600-39708",
                  "https://www.realtor.com/realestateandhomes-detail/120-Kennerly-Way_Folsom_CA_95630_M13484-47176",
                  "https://www.realtor.com/realestateandhomes-detail/124-Kennerly-Way_Folsom_CA_95630_M12663-13039",
                  "https://www.realtor.com/realestateandhomes-detail/102-Pascoe-Ct_Folsom_CA_95630_M10177-49202",
                  "https://www.realtor.com/realestateandhomes-detail/100-Grantham-Ct_Folsom_CA_95630_M28512-07680",
                  "https://www.realtor.com/realestateandhomes-detail/107-Harcourt-Way_Folsom_CA_95630_M20129-73463",
                  "https://www.realtor.com/realestateandhomes-detail/103-Moylan-Ct_Folsom_CA_95630_M29227-58289",
                  "https://www.realtor.com/realestateandhomes-detail/126-Kennerly-Way_Folsom_CA_95630_M12085-88094",
                  "https://www.realtor.com/realestateandhomes-detail/107-Tyrell-Ct_Folsom_CA_95630_M10378-72811",
                  "https://www.realtor.com/realestateandhomes-detail/102-Tyrell-Ct_Folsom_CA_95630_M11754-95937",
                  "https://www.realtor.com/realestateandhomes-detail/102-Moylan-Way_Folsom_CA_95630_M15203-17703",
                  "https://www.realtor.com/realestateandhomes-detail/108-Pascoe-Ct_Folsom_CA_95630_M28985-35427",
                  "https://www.realtor.com/realestateandhomes-detail/138-Kennerly-Way_Folsom_CA_95630_M16743-37844",
                  "https://www.realtor.com/realestateandhomes-detail/109-Moylan-Ct_Folsom_CA_95630_M11600-67837",
                  "https://www.realtor.com/realestateandhomes-detail/111-Lynton-Ct_Folsom_CA_95630_M15161-06652",
                  "https://www.realtor.com/realestateandhomes-detail/106-Moylan-Way_Folsom_CA_95630_M14264-82060",
                  "https://www.realtor.com/realestateandhomes-detail/121-Kennerly-Way_Folsom_CA_95630_M14865-17493"
              ]
          },
          {
              "key": "Census Tract",
              "value": [
                  "85.07"
              ]
          },
          {
              "key": "1 Bedroom Annual Occupancy",
              "value": [
                  ".00%"
              ]
          },
          {
              "key": "Garage Spaces",
              "value": [
                  "2"
              ]
          },
          {
              "key": "Bedrooms",
              "value": [
                  "Primary Bath",
                  "3",
                  "Primary Suite/Retreat"
              ]
          },
          {
              "key": "# of 1 Bedrooms Occupied",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Median Family Income",
              "value": [
                  "$98,911"
              ]
          },
          {
              "key": "Taxable Value",
              "value": [
                  "Land: $84,385",
                  "Total: $310,290",
                  "Additions: $225,905"
              ]
          },
          {
              "key": "Cross Street",
              "value": [
                  "Kennerly Way"
              ]
          },
          {
              "key": "Households with Children",
              "value": [
                  "73.3%"
              ]
          },
          {
              "key": "Directions to Property",
              "value": [
                  "Start on US-50. Take exit onto Prairie City Road. Turn left onto Prairie City Road. Turn right onto Iron Point Road. Turn left onto Oak Avenue Parkway. Turn right onto Kennerly Way. Turn left onto Tyrell Court. Destination is on the right!"
              ]
          },
          {
              "key": "Fireplace",
              "value": [
                  "Brick",
                  "Yes",
                  "Family Room",
                  "Wood Burning"
              ]
          },
          {
              "key": "Property Disclaimer",
              "value": [
                  "All measurements and calculations of area are approximate. Information provided by Seller/Other sources, not verified by Broker. 3cBR> All interested persons should independently verify accuracy of information. Provided properties may or may not be listed by the office/agent presenting the information. 3cBR> Copyright3c/A> &copy; 2024, MetroList Services, Inc. 3cBR> Any offer of compensation in the real estate content on this site is made exclusively to Broker Participants of the MetroList\u00ae MLS & Broker Participants of any MLS with a current reciprocal agreement with MetroList\u00ae that provides for such offers of compensation."
              ]
          },
          {
              "key": "Irrigation",
              "value": [
                  "Public District"
              ]
          },
          {
              "key": "Primary Bathroom Features",
              "value": [
                  "Closet",
                  "Tile",
                  "Double Sinks",
                  "Shower Stall(s)",
                  "Granite"
              ]
          },
          {
              "key": "Total # Owner Occupied",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Middle or Junior School District",
              "value": [
                  "Folsom-Cordova"
              ]
          },
          {
              "key": "Unit 4 Partial Baths",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Covered Spaces",
              "value": [
                  "0"
              ]
          },
          {
              "key": "xome.com Features",
              "replace": "false",
              "value": [
                  "DoorsWindows: Screened, Double Pane",
                  "GuestFacilities: 3",
                  "General: Fenced Yard.",
                  "SchoolDistrict: Folsom-cordova",
                  "Sewer: Public Sewer",
                  "Kitchen: Butler Pantry, Breakfast Area",
                  "Fireplaces: 1. Family Room, Brick",
                  "Pool: None"
              ]
          },
          {
              "key": "Zip Code",
              "value": [
                  "95630"
              ]
          },
          {
              "key": "Style",
              "value": [
                  "Traditional"
              ]
          },
          {
              "key": "Population",
              "value": [
                  "44,758"
              ]
          },
          {
              "key": "Width",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "County Transfer Tax Rate",
              "value": [
                  ".00%"
              ]
          },
          {
              "key": "Road Surface Type",
              "value": [
                  "Paved"
              ]
          },
          {
              "key": "Subdivision",
              "value": [
                  "Broadstone"
              ]
          },
          {
              "key": "xome.com Days on site",
              "replace": "true",
              "value": [
                  "92"
              ]
          },
          {
              "key": "Sewer",
              "value": [
                  "Public Sewer"
              ]
          },
          {
              "key": "Heating",
              "value": [
                  "CENTRAL",
                  "Central"
              ]
          },
          {
              "key": "# of 4 Bedrooms Occupied",
              "value": [
                  "0"
              ]
          },
          {
              "key": "# Commercial Units",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Utility Information",
              "value": [
                  "Water Source: Public",
                  "Sewer: Public Sewer",
                  "Electric: 220 Volts",
                  "Irrigation Source: Public District"
              ]
          },
          {
              "key": "Bedroom Information",
              "value": [
                  "Master Bedroom Features: Closet, Outside Access",
                  "Master Bedroom Dimensions: 0x0",
                  "# of Bedrooms (Total): 3"
              ]
          },
          {
              "key": "Laundry",
              "value": [
                  "In Closet",
                  "Cabinets",
                  "Hookup - Electric",
                  "Hookups Only"
              ]
          },
          {
              "key": "Unit 2 Bedrooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Unit 3 # of Rooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Spa",
              "value": [
                  "false"
              ]
          },
          {
              "key": "Unit 4 Approx SqFt",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "Association Fee",
              "value": [
                  "$.00"
              ]
          },
          {
              "key": "Utilities",
              "value": [
                  "Public"
              ]
          },
          {
              "key": "Heating & Cooling",
              "value": [
                  "Heating Type: Central",
                  "Heating: Central, Fireplace(s)",
                  "Heating Fuel Type: Gas",
                  "Cooling: Ceiling Fan(s), Central",
                  "Air Conditioning Type: Central"
              ]
          },
          {
              "key": "mlsName",
              "value": [
                  "Metrolist Services, Inc"
              ]
          },
          {
              "key": "Kitchen Features",
              "value": [
                  "Tile Counter",
                  "Breakfast Area",
                  "Pantry Cabinet"
              ]
          },
          {
              "key": "Room Information",
              "replace": "true",
              "value": [
                  "Dining Room Dimensions: 0x0",
                  "Room Type: Master Bathroom, Master Bedroom, Family Room, Kitchen",
                  "Living Room Dimensions: 0x0",
                  "Living Room Features: Other",
                  "Main Level: Bedroom(s), Family Room, Master Bedroom, Full Bath(s), Garage, Kitchen, Street Entrance",
                  "Dining Room Features: Breakfast Nook",
                  "3rd Bedroom Dimensions: 0x0",
                  "4th Bedroom Dimensions: 0x0",
                  "Family Room Dimensions: 0x0",
                  "Kitchen Dimensions: 0x0",
                  "2nd Bedroom Dimensions: 0x0",
                  "Kitchen Features: Breakfast Area, Pantry Cabinet, Tile Counter"
              ]
          },
          {
              "key": "# of Fireplaces",
              "value": [
                  "1"
              ]
          },
          {
              "key": "Berth Size Width",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "City",
              "value": [
                  "Folsom"
              ]
          },
          {
              "key": "Unit 3 Bedrooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Possible Bedrooms",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "Dining Room Features",
              "value": [
                  "Breakfast Nook"
              ]
          },
          {
              "key": "Unit 2 Partial Baths",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Unit 2 Approx SqFt",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "Half Bathrooms",
              "value": [
                  "0"
              ]
          },
          {
              "key": "2 Bedroom Annual Occupancy",
              "value": [
                  ".00%"
              ]
          },
          {
              "key": "Property History",
              "value": [
                  "Tue Jul 09 2002 00:00:00 GMT+0000 (Coordinated Universal Time) - Sold (Public Records) - $239,000",
                  "Fri Jan 20 1995 00:00:00 GMT+0000 (Coordinated Universal Time) - Sold (Public Records) - $137,500",
                  "Tue Oct 25 1994 00:00:00 GMT+0000 (Coordinated Universal Time) - Sold (Public Records) - $142,000"
              ]
          },
          {
              "key": "2nd Unit Bedrooms",
              "value": [
                  "0.0"
              ]
          },
          {
              "key": "Horse Property",
              "value": [
                  "false"
              ]
          },
          {
              "key": "# of 3 Bedrooms Occupied",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Living Room Features",
              "value": [
                  "Other"
              ]
          },
          {
              "key": "MLS Type",
              "value": [
                  "Residential / Single Family Residence"
              ]
          },
          {
              "key": "Unit 3 Full Baths",
              "value": [
                  "0"
              ]
          },
          {
              "key": "County",
              "value": [
                  "Sacramento"
              ]
          },
          {
              "key": "Fireplace Information",
              "value": [
                  "# of Fireplaces: 1",
                  "Has Fireplace"
              ]
          },
          {
              "key": "Year Built Source",
              "value": [
                  "Assessor Auto-Fill"
              ]
          },
          {
              "key": "# of Studio Units",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Dining Room",
              "value": [
                  "Breakfast Nook"
              ]
          },
          {
              "key": "# Of Buildings",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Patio And Porch Features",
              "value": [
                  "Front Porch"
              ]
          },
          {
              "key": "Parking Features",
              "value": [
                  "Attached",
                  "RV Possible",
                  "Facing Front",
                  "Garage Door Opener",
                  "Uncov Prkng Spc (1)"
              ]
          },
          {
              "key": "Electric",
              "value": [
                  "220 Volts"
              ]
          },
          {
              "key": "xome.com Saves",
              "replace": "true",
              "value": [
                  "0"
              ]
          },
          {
              "key": "Virtual Media Count",
              "value": [
                  "1"
              ]
          },
          {
              "key": "xome.com Views",
              "replace": "true",
              "value": [
                  "19"
              ]
          },
          {
              "key": "Window Features",
              "value": [
                  "Window Coverings",
                  "Dual Pane Full",
                  "Window Screens"
              ]
          },
          {
              "key": "Senior High School District",
              "value": [
                  "Folsom-Cordova"
              ]
          },
          {
              "key": "Garage",
              "value": [
                  "Yes"
              ]
          },
          {
              "key": "Nearby Similar Homes",
              "value": [
                  "100 Stoney Hill Dr, Folsom, CA 95630",
                  "841 Morton Way, Folsom, CA 95630",
                  "152 Biscayne Way, Folsom, CA 95630",
                  "645 Chorley Ct, Folsom, CA 95630",
                  "Undisclosed Address, Folsom, CA 95630"
              ]
          },
          {
              "key": "Bathrooms",
              "value": [
                  "2.0"
              ]
          },
          {
              "key": "License Fee",
              "value": [
                  "$.00"
              ]
          },
          {
              "key": "Lot Size Source",
              "value": [
                  "Assessor Auto-Fill"
              ]
          }
      ],
      "floorSizeUnit": "sq ft",
      "floorSizeValue": 1352,
      "geoLocation": "POINT (-121.138663 38.660197)",
      "id": "AW8fy98RcWockGYk7pUf",
      "imageURLs": [
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_1_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_2_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_3_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_4_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_5_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_6_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_7_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_8_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_9_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_10_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_11_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_12_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_13_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_14_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_15_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_16_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_17_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_18_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_19_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_20_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_21_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_22_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_23_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_24_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_25_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_26_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_27_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_28_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_29_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_30_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_31_0.jpg",
          "https://ssl.cdn-redfin.com/photo/77/mbphotov2/275/genMid.224116275_32_0.jpg",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/images/0/0/224116275.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-1.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-2.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-3.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-4.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-5.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-6.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-7.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-8.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-9.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-10.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-11.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-12.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-13.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-14.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-15.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-16.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-17.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-18.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-19.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-20.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-21.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-22.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-23.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-24.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-25.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-26.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-27.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-28.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-29.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-30.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-31.jpg?cd=63864789480",
          "https://xomesearch.propertiescdn.com/ListingImages/camlmls/addl_picts/0/0/224116275-32.jpg?cd=63864789480",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/0e0a9196-7f6a-48c8-960c-dda1ec7461ae.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/12f90805-f6ce-498a-9d7b-0ba3249b3680.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/d3794439-bb6d-47b9-b211-8d252b1ec578.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/29a1760f-fc1a-4644-9757-d1311de8acd4.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/649e7ae4-7d41-47c9-a009-ab9b69a29066.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/02ecd6f2-c335-4ca4-96a9-ddfbb4c50673.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/32f5fbef-fdf5-4d6c-bc6c-0b985555e175.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/7c2ecabb-c023-4de2-8e6b-b5d3079c4b0a.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/6da2e732-efcf-402b-bba1-4f4ac5a9886a.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/569291a7-d244-47a4-85ee-d10e147462cf.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/92182263-0474-497f-b9a8-d54e071b7234.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/70929b2f-b964-439a-aabc-6492096bf4e9.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/6e942584-ea03-4862-96fb-1553b61b7c9f.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/805fa3fb-9133-4b3f-8846-483f4a79308d.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/d4fd2107-2876-4c52-87fa-1f8006100880.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/ac9df283-aaf7-4145-b3fc-ea2390c9dea2.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/ce1bd26b-ff06-4899-8b1e-6027fcc85808.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/2f067584-a904-45c2-990d-dad8d0663448.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/a2ebf1ba-aaa7-47a8-9d5d-724b63c26bf7.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/a2cb07df-be62-4f43-b19f-921a88596eda.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/e5afc4bd-1b4c-433d-9bf9-de74dee70834.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/5044cad8-5296-41f8-a607-85930737702a.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/7f0b2eef-ff71-496e-96f4-739d99067158.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/79bff72c-0df9-45d5-81aa-558a1e8a4895.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/6e38f909-3b13-425f-9587-3b60e4908e3f.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/f22dd4d0-96ce-4adf-8e89-8060bb8ce744.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/91681e57-cf47-40b1-ab95-3ed405d8e4ae.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/b1487194-6654-41ab-8430-201827922833.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/486c78fd-7025-4aff-8bfc-9040e029125c.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/52a0bfb3-d5d3-41be-80d3-a02436e37c6a.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/1c20ec9d-c05b-4366-8324-4a7d8ed42dd6.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/ad537bac-c445-4695-8f84-0983bee747bc.jpg",
          "https://mediarem.metrolist.net/metrolist/listingpics/bigphoto/2024/10/17/b4f47148-9910-4bcd-b70a-a3501ce851ca.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_0_0a08d/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_1_81b8c/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_2_01a3e/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_3_ac42d/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_4_9f891/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_5_31180/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_6_57378/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_7_bb31a/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_8_9b1e1/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_9_aeb05/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_10_4a241/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_11_4b6a4/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_12_48f9f/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_13_15721/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_14_87ca3/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_15_a2177/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_16_586f7/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_17_5b313/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_18_e9329/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_19_6c836/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_20_4a2e9/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_21_b8dc0/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_22_a763d/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_23_34910/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_24_ecee3/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_25_5978b/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_26_c1828/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_27_dd89c/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_28_db08e/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_29_fce16/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_30_077bc/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_31_bf289/origin.jpg",
          "https://www.compass.com/m/e8b3dc597752c4871b25d85795740603ecc8e9b3_img_32_ece2d/origin.jpg",
          "https://maps.googleapis.com/maps/api/streetview?location=108%20Tyrell%20Ct%2C%20Folsom%2C%20CA%2095630&size=800x320&key=AIzaSyCdPAfXsr51Cz9Y9jxqQauAROueuVUWcvM"
      ],
      "keys": [
          "us/ca/folsom/108tyrellct",
          "homefinder.com-3ON4K0p",
          "taxid/us/ca/07210400170000"
      ],
      "latitude": "38.660197",
      "listingName": "108 Tyrell Court",
      "longitude": "-121.138663",
      "lotSizeUnit": "acs",
      "lotSizeValue": 0.19,
      "mlsNumber": "224116275",
      "mostRecentBrokerAgent": "Shon Delia",
      "mostRecentBrokerCompany": "Exp Realty Of California Inc.",
      "mostRecentBrokerDateSeen": "2025-01-16T23:59:33.696Z",
      "mostRecentPriceAmount": 624950,
      "mostRecentPriceDate": "2024-11-25T00:00:00.000Z",
      "mostRecentPriceDomain": "www.mlslistings.com",
      "mostRecentPriceFirstDateSeen": "2025-01-14T19:55:51.816Z",
      "mostRecentStatus": "For Sale",
      "mostRecentStatusDate": "2024-10-17T00:00:00.000Z",
      "mostRecentStatusFirstDateSeen": "2024-10-30T06:36:17.816Z",
      "neighborhoods": [
          "BROADSTONE 01A",
          "Broadstone",
          "California"
      ],
      "numBathroom": 2,
      "numBedroom": 3,
      "numFloor": 1,
      "numRoom": 5,
      "parking": [
          "Garage Spaces: 2",
          "Yes -\u00a02 spaces",
          "Garage/Parking Sq. Ft: 397",
          "Garage",
          "Parking Features: Attached",
          "# of Parking Spaces: 2",
          "Driveway Sidewalks: Paved Driveway",
          "2 Garage Spaces. 2 Parking Spaces.",
          "Parking Type: Covered"
      ],
      "people": [
          {
              "dateSeen": "2025-01-17T00:00:00.000Z",
              "name": "Kevin Prokosch",
              "title": "Listing Agent"
          },
          {
              "dateSeen": "2025-01-17T00:00:00.000Z",
              "name": "Shon Delia",
              "title": "Listing Agent"
          },
          {
              "dateSeen": "2024-11-26T04:54:37.562Z",
              "email": "kevin@deliahomes.com",
              "name": "Kevin Prokosch",
              "phone": "916-7495610",
              "title": "Listing Agent"
          },
          {
              "dateSeen": "2024-11-26T04:54:37.562Z",
              "email": "shon@deliahomes.com",
              "name": "Shon R Delia",
              "phone": "916-9323573",
              "title": "Alternative Listing Agent"
          }
      ],
      "postalCode": "95630",
      "prices": [
          {
              "amountMax": 639950,
              "amountMin": 639950,
              "currency": "USD",
              "date": "2024-10-17T00:00:00.000Z",
              "dateSeen": [
                  "2024-11-02T04:37:25.858Z",
                  "2024-11-05T04:54:59.680Z",
                  "2024-10-30T06:36:17.810Z",
                  "2024-11-06T03:06:12.038Z",
                  "2024-10-22T05:25:36.995Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 473.34
          },
          {
              "amountMax": 624950,
              "amountMin": 624950,
              "currency": "USD",
              "date": "2024-10-17T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-27T22:01:35.963Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 462.24
          },
          {
              "amountMax": 624950,
              "amountMin": 624950,
              "currency": "USD",
              "date": "2024-11-25T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-14T19:55:51.816Z"
              ],
              "pricePerSquareFoot": 462.24
          },
          {
              "amountMax": 624950,
              "amountMin": 624950,
              "currency": "USD",
              "date": "2024-10-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-11-21T00:57:21.276Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 462.24
          },
          {
              "amountMax": 624950,
              "amountMin": 624950,
              "currency": "USD",
              "date": "2024-10-17T00:00:00.000Z",
              "dateSeen": [
                  "2024-11-12T19:09:50.906Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 462.24
          },
          {
              "amountMax": 624950,
              "amountMin": 624950,
              "currency": "USD",
              "date": "2024-10-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-11-13T13:13:39.407Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 462.24
          },
          {
              "amountMax": 639950,
              "amountMin": 639950,
              "availability": "true",
              "currency": "USD",
              "date": "2024-11-21T01:15:26.000Z",
              "dateSeen": [
                  "2024-11-26T04:54:37.563Z"
              ],
              "isSold": "false",
              "pricePerSquareFoot": 462.24
          },
          {
              "amountMax": 624950,
              "amountMin": 624950,
              "currency": "USD",
              "date": "2024-10-18T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-10T01:17:36.812Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 462.24
          },
          {
              "amountMax": 624950,
              "amountMin": 624950,
              "currency": "USD",
              "date": "2024-10-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-11-22T21:30:32.786Z",
                  "2024-11-25T12:00:27.718Z",
                  "2024-11-18T15:14:43.672Z"
              ],
              "pricePerSquareFoot": 462.24
          },
          {
              "amountMax": 615000,
              "amountMin": 615000,
              "currency": "USD",
              "date": "2024-10-17T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-16T23:59:34.150Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 454.88
          },
          {
              "amountMax": 639950,
              "amountMin": 639950,
              "currency": "USD",
              "date": "2024-10-17T00:00:00.000Z",
              "dateSeen": [
                  "2024-10-30T21:37:56.768Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 473.34
          },
          {
              "amountMax": 624950,
              "amountMin": 624950,
              "currency": "USD",
              "date": "2024-10-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-11-09T00:42:34.747Z",
                  "2024-11-12T15:17:17.605Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 462.24
          },
          {
              "amountMax": 624950,
              "amountMin": 624950,
              "currency": "USD",
              "date": "2024-10-17T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-09T21:50:58.327Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 462.24
          },
          {
              "amountMax": 624950,
              "amountMin": 624950,
              "currency": "USD",
              "date": "2024-10-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-11-15T17:05:42.630Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 462.24
          },
          {
              "amountMax": 624950,
              "amountMin": 624950,
              "currency": "USD",
              "date": "2024-10-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-11-21T05:34:27.860Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 462.24
          },
          {
              "amountMax": 624950,
              "amountMin": 624950,
              "currency": "USD",
              "date": "2024-11-25T00:00:00.000Z",
              "dateSeen": [
                  "2024-11-29T02:35:31.246Z"
              ],
              "pricePerSquareFoot": 462.24
          },
          {
              "amountMax": 624950,
              "amountMin": 624950,
              "currency": "USD",
              "date": "2024-10-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-11-12T14:59:29.424Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 462.24
          },
          {
              "amountMax": 624950,
              "amountMin": 624950,
              "currency": "USD",
              "date": "2024-10-17T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-28T22:05:42.553Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 462.24
          },
          {
              "amountMax": 624950,
              "amountMin": 624950,
              "currency": "USD",
              "date": "2024-10-18T00:00:00.000Z",
              "dateSeen": [
                  "2024-11-22T08:02:08.889Z"
              ],
              "isSale": "false",
              "pricePerSquareFoot": 462.24
          },
          {
              "amountMax": 624950,
              "amountMin": 624950,
              "currency": "USD",
              "date": "2024-11-25T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-03T00:57:09.511Z"
              ],
              "pricePerSquareFoot": 462.24
          }
      ],
      "propertyType": "Single Family Dwelling",
      "province": "CA",
      "sourceURLs": [
          "https://assessorparcelviewer.saccounty.gov/GISWebService/api/gisapps/parcels/public/07210400170000",
          "https://homefinder.com/home/3ON4K0p/108-Tyrell-Ct-Folsom-CA-95630",
          "https://www.compass.com/listing/108-tyrell-court-folsom-ca-95630/1689304032945285121/",
          "https://www.redfin.com/CA/Folsom/108-Tyrell-Ct-95630/home/19344046",
          "https://datafiniti.co/mls",
          "https://datafiniti.co/",
          "https://www.remax.com/ca/folsom/home-details/108-tyrell-ct-folsom-ca-95630/16105786630728724792/M00000091/224116275",
          "https://www.xome.com/homes-for-sale/108-Tyrell-Court-Folsom-CA-95630-399511033",
          "https://www.mlslistings.com/property/me224116275/108-tyrell-ct-folsom-ca-95630/16733739"
      ],
      "statuses": [
          {
              "date": "1994-10-25T00:00:00.000Z",
              "dateSeen": [
                  "1994-10-25T00:00:00.000Z"
              ],
              "firstDateSeen": "1994-10-25T00:00:00.000Z",
              "lastDateSeen": "1994-10-25T00:00:00.000Z",
              "type": "Sold"
          },
          {
              "date": "2024-10-17T00:00:00.000Z",
              "dateSeen": [
                  "2024-10-30T06:36:17.816Z",
                  "2025-01-12T02:09:18.227Z",
                  "2024-10-30T21:37:56.289Z",
                  "2024-11-05T04:54:59.266Z",
                  "2025-01-10T01:17:36.337Z",
                  "2025-01-14T19:55:51.823Z"
              ],
              "firstDateSeen": "2024-10-30T06:36:17.816Z",
              "lastDateSeen": "2025-01-14T19:55:51.823Z",
              "type": "For Sale"
          },
          {
              "date": "2024-10-17T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-01T20:46:30.047Z"
              ],
              "firstDateSeen": "2024-12-01T20:46:30.047Z",
              "lastDateSeen": "2024-12-01T20:46:30.047Z",
              "type": "For Sale"
          },
          {
              "date": "2024-10-17T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-16T23:59:33.687Z"
              ],
              "firstDateSeen": "2025-01-16T23:59:33.687Z",
              "lastDateSeen": "2025-01-16T23:59:33.687Z",
              "type": "For Sale"
          },
          {
              "date": "2024-10-17T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-25T19:27:29.961Z"
              ],
              "firstDateSeen": "2024-12-25T19:27:29.961Z",
              "lastDateSeen": "2024-12-25T19:27:29.961Z",
              "type": "For Sale"
          },
          {
              "dateSeen": [
                  "2021-12-22T21:31:25.202Z"
              ],
              "firstDateSeen": "2021-12-22T21:31:25.202Z",
              "lastDateSeen": "2021-12-22T21:31:25.202Z",
              "type": "Off Market"
          },
          {
              "date": "2024-10-17T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-09T21:50:57.864Z"
              ],
              "firstDateSeen": "2025-01-09T21:50:57.864Z",
              "lastDateSeen": "2025-01-09T21:50:57.864Z",
              "type": "For Sale"
          },
          {
              "date": "2024-10-17T00:00:00.000Z",
              "dateSeen": [
                  "2024-11-12T19:09:50.451Z"
              ],
              "firstDateSeen": "2024-11-12T19:09:50.451Z",
              "lastDateSeen": "2024-11-12T19:09:50.451Z",
              "type": "For Sale"
          },
          {
              "date": "2024-10-17T00:00:00.000Z",
              "dateSeen": [
                  "2025-01-03T00:57:09.518Z"
              ],
              "firstDateSeen": "2025-01-03T00:57:09.518Z",
              "lastDateSeen": "2025-01-03T00:57:09.518Z",
              "type": "For Sale"
          },
          {
              "date": "2024-10-17T00:00:00.000Z",
              "dateSeen": [
                  "2024-12-28T22:05:42.112Z"
              ],
              "firstDateSeen": "2024-12-28T22:05:42.112Z",
              "lastDateSeen": "2024-12-28T22:05:42.112Z",
              "type": "For Sale"
          },
          {
              "date": "1995-01-20T08:00:00.000Z",
              "type": "Sold"
          },
          {
              "date": "2002-07-09T07:00:00.000Z",
              "type": "Sold"
          },
          {
              "date": "1995-01-20T08:00:00.000Z",
              "type": "Sold"
          },
          {
              "date": "1994-10-25T07:00:00.000Z",
              "type": "Sold"
          },
          {
              "date": "1994-10-25T07:00:00.000Z",
              "type": "Sold"
          },
          {
              "date": "2002-07-09T07:00:00.000Z",
              "type": "Sold"
          }
      ],
      "subdivision": "Broadstone",
      "taxID": "072-1040-017-0000",
      "transactions": [
          {
              "price": 137500,
              "saleDate": "1995-01-20T08:00:00.000Z"
          },
          {
              "price": 239000,
              "saleDate": "2002-07-09T07:00:00.000Z"
          },
          {
              "price": 137500,
              "saleDate": "1995-01-20T08:00:00.000Z"
          },
          {
              "price": 142000,
              "saleDate": "1994-10-25T07:00:00.000Z"
          },
          {
              "price": 142000,
              "saleDate": "1994-10-25T07:00:00.000Z"
          },
          {
              "price": 239000,
              "saleDate": "2002-07-09T07:00:00.000Z"
          }
      ],
      "yearBuilt": 1992
  }
]

  
  
  