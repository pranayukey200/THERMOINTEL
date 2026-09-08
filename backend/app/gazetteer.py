"""
Comprehensive Indian Gazetteer for GIS Search and Navigation.
Maps Indian cities, industrial clusters, mining belts, and states
to geographic coordinates, recommended zoom levels, and bounding boxes.
"""
from typing import Optional, Dict, List, Any

# Dictionary of Indian locations
INDIAN_LOCATIONS: Dict[str, Dict[str, Any]] = {
    # Industrial & Mining Clusters
    "bhilai": {
        "name": "Bhilai Industrial Cluster",
        "state": "Chhattisgarh",
        "type": "industrial_hub",
        "lat": 21.1938,
        "lon": 81.3509,
        "zoom": 11,
        "bbox": [20.8, 80.9, 21.6, 81.8],
        "description": "Bhilai Steel Plant & Heavy Industrial Corridor"
    },
    "korba": {
        "name": "Korba Power Cluster",
        "state": "Chhattisgarh",
        "type": "industrial_hub",
        "lat": 22.3595,
        "lon": 82.7501,
        "zoom": 11,
        "bbox": [22.0, 82.3, 22.8, 83.2],
        "description": "Thermal Power & Coal Mining Belt"
    },
    "singrauli": {
        "name": "Singrauli Thermal Belt",
        "state": "Madhya Pradesh",
        "type": "industrial_hub",
        "lat": 24.1997,
        "lon": 82.6644,
        "zoom": 11,
        "bbox": [23.7, 82.2, 24.7, 83.2],
        "description": "Super Thermal Power Plants & Open-Cast Coal Mines"
    },
    "dhanbad": {
        "name": "Dhanbad Coalfield",
        "state": "Jharkhand",
        "type": "industrial_hub",
        "lat": 23.7957,
        "lon": 86.4304,
        "zoom": 11,
        "bbox": [23.4, 86.0, 24.2, 86.9],
        "description": "Jharia Coalfield & Coking Coal Mining Hub"
    },
    "jharia": {
        "name": "Jharia Coalfield",
        "state": "Jharkhand",
        "type": "industrial_hub",
        "lat": 23.7441,
        "lon": 86.4131,
        "zoom": 12,
        "bbox": [23.5, 86.2, 23.9, 86.6],
        "description": "Historic Subsurface Coal Fire & Mining Zone"
    },
    "bokaro": {
        "name": "Bokaro Steel City",
        "state": "Jharkhand",
        "type": "industrial_hub",
        "lat": 23.6693,
        "lon": 86.1511,
        "zoom": 11,
        "bbox": [23.3, 85.8, 24.1, 86.5],
        "description": "SAIL Steel Plant & Industrial Belt"
    },
    "rourkela": {
        "name": "Rourkela Steel Hub",
        "state": "Odisha",
        "type": "industrial_hub",
        "lat": 22.2604,
        "lon": 84.8536,
        "zoom": 11,
        "bbox": [21.9, 84.5, 22.7, 85.3],
        "description": "Rourkela Steel Plant & Heavy Metallurgy"
    },
    "angul": {
        "name": "Angul Industrial Cluster",
        "state": "Odisha",
        "type": "industrial_hub",
        "lat": 20.8444,
        "lon": 85.1511,
        "zoom": 11,
        "bbox": [20.4, 84.7, 21.3, 85.6],
        "description": "NALCO Smelter & Jindal Steel Cluster"
    },
    "jamshedpur": {
        "name": "Jamshedpur Industrial Zone",
        "state": "Jharkhand",
        "type": "industrial_hub",
        "lat": 22.8046,
        "lon": 86.2029,
        "zoom": 11,
        "bbox": [22.4, 85.8, 23.2, 86.6],
        "description": "Tata Steel & Heavy Engineering Corridor"
    },
    "chandrapur": {
        "name": "Chandrapur Super Thermal Hub",
        "state": "Maharashtra",
        "type": "industrial_hub",
        "lat": 19.9615,
        "lon": 79.2961,
        "zoom": 11,
        "bbox": [19.5, 78.8, 20.4, 79.8],
        "description": "CSTPS Thermal Power Station & Coal Mines"
    },
    "durgapur": {
        "name": "Durgapur Steel Belt",
        "state": "West Bengal",
        "type": "industrial_hub",
        "lat": 23.5204,
        "lon": 87.3119,
        "zoom": 11,
        "bbox": [23.2, 87.0, 23.9, 87.7],
        "description": "Durgapur Steel Plant & Alloy Steel Works"
    },
    "asansol": {
        "name": "Asansol - Raniganj Coal Belt",
        "state": "West Bengal",
        "type": "industrial_hub",
        "lat": 23.6739,
        "lon": 86.9524,
        "zoom": 11,
        "bbox": [23.3, 86.6, 24.1, 87.3],
        "description": "Raniganj Coalfields & Heavy Industrial Belt"
    },
    "hazira": {
        "name": "Hazira Industrial Belt",
        "state": "Gujarat",
        "type": "industrial_hub",
        "lat": 21.1070,
        "lon": 72.6465,
        "zoom": 11,
        "bbox": [20.8, 72.4, 21.6, 73.2],
        "description": "Petrochemicals, Steel & LNG Terminal Complex"
    },
    "jamnagar": {
        "name": "Jamnagar Refinery Complex",
        "state": "Gujarat",
        "type": "industrial_hub",
        "lat": 22.4707,
        "lon": 70.0577,
        "zoom": 11,
        "bbox": [22.0, 69.6, 22.9, 70.5],
        "description": "Petroleum Refining & Petrochemical Hub"
    },
    "ankleshwar": {
        "name": "Ankleshwar Chemical PCPIR",
        "state": "Gujarat",
        "type": "industrial_hub",
        "lat": 21.6264,
        "lon": 73.0152,
        "zoom": 11,
        "bbox": [21.3, 72.5, 22.0, 73.4],
        "description": "Petroleum, Chemicals & Petrochemicals Zone"
    },
    "vapi": {
        "name": "Vapi Industrial Estate",
        "state": "Gujarat",
        "type": "industrial_hub",
        "lat": 20.3893,
        "lon": 72.9106,
        "zoom": 11,
        "bbox": [20.1, 72.6, 20.7, 73.2],
        "description": "Chemical & Pharmaceutical Manufacturing Belt"
    },
    "tarapur": {
        "name": "Tarapur Industrial Zone",
        "state": "Maharashtra",
        "type": "industrial_hub",
        "lat": 19.8656,
        "lon": 72.6841,
        "zoom": 11,
        "bbox": [19.5, 72.4, 20.2, 73.0],
        "description": "Atomic Power & MIDC Chemical Industrial Belt"
    },
    "paradeep": {
        "name": "Paradeep Port & Refinery",
        "state": "Odisha",
        "type": "industrial_hub",
        "lat": 20.3165,
        "lon": 86.6114,
        "zoom": 11,
        "bbox": [20.0, 86.2, 20.7, 87.0],
        "description": "IOCL Oil Refinery, Petrochemicals & Port"
    },
    "bellary": {
        "name": "Bellary - Toranagallu Steel Belt",
        "state": "Karnataka",
        "type": "industrial_hub",
        "lat": 15.1394,
        "lon": 76.9214,
        "zoom": 11,
        "bbox": [14.8, 76.5, 15.6, 77.3],
        "description": "JSW Vijayanagar Steel & Iron Ore Mining"
    },
    "neyveli": {
        "name": "Neyveli Lignite Power Hub",
        "state": "Tamil Nadu",
        "type": "industrial_hub",
        "lat": 11.5976,
        "lon": 79.4862,
        "zoom": 11,
        "bbox": [11.3, 79.2, 11.9, 79.8],
        "description": "NLC Lignite Mines & Thermal Power Complex"
    },
    "ramagundam": {
        "name": "Ramagundam NTPC Super Thermal",
        "state": "Telangana",
        "type": "industrial_hub",
        "lat": 18.7551,
        "lon": 79.5134,
        "zoom": 11,
        "bbox": [18.4, 79.1, 19.1, 79.9],
        "description": "NTPC Super Thermal Power & Singareni Coalfields"
    },
    "panipat": {
        "name": "Panipat Refinery & Textile Hub",
        "state": "Haryana",
        "type": "industrial_hub",
        "lat": 29.3909,
        "lon": 76.9635,
        "zoom": 11,
        "bbox": [29.1, 76.6, 29.7, 77.3],
        "description": "IOCL Panipat Refinery & Heavy Textiles"
    },
    "bathinda": {
        "name": "Bathinda Refinery Hub",
        "state": "Punjab",
        "type": "industrial_hub",
        "lat": 30.2110,
        "lon": 74.9455,
        "zoom": 11,
        "bbox": [29.9, 74.6, 30.6, 75.3],
        "description": "Guru Gobind Singh Oil Refinery & Thermal Plant"
    },
    "ludhiana": {
        "name": "Ludhiana Industrial Corridor",
        "state": "Punjab",
        "type": "industrial_hub",
        "lat": 30.9010,
        "lon": 75.8573,
        "zoom": 11,
        "bbox": [30.6, 75.5, 31.2, 76.2],
        "description": "Bicycle, Machine Tools & Heavy Manufacturing"
    },
    "visakhapatnam": {
        "name": "Visakhapatnam Steel & Port",
        "state": "Andhra Pradesh",
        "type": "industrial_hub",
        "lat": 17.6868,
        "lon": 83.2185,
        "zoom": 11,
        "bbox": [17.3, 82.8, 18.1, 83.6],
        "description": "Vizag Steel Plant, HPCL Refinery & Naval Port"
    },
    "vizag": {
        "name": "Visakhapatnam (Vizag)",
        "state": "Andhra Pradesh",
        "type": "industrial_hub",
        "lat": 17.6868,
        "lon": 83.2185,
        "zoom": 11,
        "bbox": [17.3, 82.8, 18.1, 83.6],
        "description": "Steel, Petroleum Refining & Coastal Port"
    },

    # Major Metropolitan Cities
    "delhi": {
        "name": "Delhi NCR",
        "state": "National Capital Region",
        "type": "metro",
        "lat": 28.6139,
        "lon": 77.2090,
        "zoom": 10,
        "bbox": [28.0, 76.5, 29.2, 77.8],
        "description": "National Capital Region Industrial & Urban Belt"
    },
    "new delhi": {
        "name": "New Delhi",
        "state": "Delhi",
        "type": "city",
        "lat": 28.6139,
        "lon": 77.2090,
        "zoom": 11,
        "bbox": [28.3, 76.8, 28.9, 77.5],
        "description": "National Capital of India"
    },
    "noida": {
        "name": "Noida / Greater Noida",
        "state": "Uttar Pradesh",
        "type": "city",
        "lat": 28.5355,
        "lon": 77.3910,
        "zoom": 11,
        "bbox": [28.3, 77.2, 28.7, 77.6],
        "description": "Electronics & Industrial Manufacturing Zone"
    },
    "gurgaon": {
        "name": "Gurugram (Gurgaon)",
        "state": "Haryana",
        "type": "city",
        "lat": 28.4595,
        "lon": 77.0266,
        "zoom": 11,
        "bbox": [28.3, 76.8, 28.6, 77.2],
        "description": "Automotive, Technology & Industrial Hub"
    },
    "gurugram": {
        "name": "Gurugram (Gurgaon)",
        "state": "Haryana",
        "type": "city",
        "lat": 28.4595,
        "lon": 77.0266,
        "zoom": 11,
        "bbox": [28.3, 76.8, 28.6, 77.2],
        "description": "Automotive, Technology & Industrial Hub"
    },
    "mumbai": {
        "name": "Mumbai Metropolitan Region",
        "state": "Maharashtra",
        "type": "metro",
        "lat": 19.0760,
        "lon": 72.8777,
        "zoom": 10,
        "bbox": [18.7, 72.6, 19.4, 73.2],
        "description": "Financial Capital & Petrochemical Terminals"
    },
    "kolkata": {
        "name": "Kolkata Metropolitan Area",
        "state": "West Bengal",
        "type": "metro",
        "lat": 22.5726,
        "lon": 88.3639,
        "zoom": 10,
        "bbox": [22.2, 88.0, 22.9, 88.7],
        "description": "Eastern India Commercial & Port Hub"
    },
    "chennai": {
        "name": "Chennai Metropolitan Area",
        "state": "Tamil Nadu",
        "type": "metro",
        "lat": 13.0827,
        "lon": 80.2707,
        "zoom": 10,
        "bbox": [12.7, 79.9, 13.4, 80.6],
        "description": "Automotive & Thermal Power Corridor (Ennore/Manali)"
    },
    "bengaluru": {
        "name": "Bengaluru",
        "state": "Karnataka",
        "type": "metro",
        "lat": 12.9716,
        "lon": 77.5946,
        "zoom": 10,
        "bbox": [12.6, 77.3, 13.3, 77.9],
        "description": "Karnataka Capital & Manufacturing Corridor"
    },
    "bangalore": {
        "name": "Bengaluru (Bangalore)",
        "state": "Karnataka",
        "type": "metro",
        "lat": 12.9716,
        "lon": 77.5946,
        "zoom": 10,
        "bbox": [12.6, 77.3, 13.3, 77.9],
        "description": "Karnataka Capital & Manufacturing Corridor"
    },
    "hyderabad": {
        "name": "Hyderabad Metropolitan Area",
        "state": "Telangana",
        "type": "metro",
        "lat": 17.3850,
        "lon": 78.4867,
        "zoom": 10,
        "bbox": [17.1, 78.2, 17.7, 78.8],
        "description": "Pharmaceutical, Defense & Industrial Corridor"
    },
    "ahmedabad": {
        "name": "Ahmedabad",
        "state": "Gujarat",
        "type": "city",
        "lat": 23.0225,
        "lon": 72.5714,
        "zoom": 10,
        "bbox": [22.8, 72.3, 23.3, 72.8],
        "description": "Textile, Chemical & Engineering Corridor"
    },
    "pune": {
        "name": "Pune Industrial Region",
        "state": "Maharashtra",
        "type": "city",
        "lat": 18.5204,
        "lon": 73.8567,
        "zoom": 10,
        "bbox": [18.3, 73.6, 18.8, 74.1],
        "description": "Automotive, Foundry & Engineering Hub"
    },
    "jaipur": {
        "name": "Jaipur",
        "state": "Rajasthan",
        "type": "city",
        "lat": 26.9124,
        "lon": 75.7873,
        "zoom": 10,
        "bbox": [26.7, 75.5, 27.2, 76.1],
        "description": "Rajasthan Capital & Vishwakarma Industrial Area"
    },
    "lucknow": {
        "name": "Lucknow",
        "state": "Uttar Pradesh",
        "type": "city",
        "lat": 26.8467,
        "lon": 80.9462,
        "zoom": 10,
        "bbox": [26.6, 80.7, 27.1, 81.2],
        "description": "Capital of Uttar Pradesh"
    },
    "kanpur": {
        "name": "Kanpur Industrial Hub",
        "state": "Uttar Pradesh",
        "type": "city",
        "lat": 26.4499,
        "lon": 80.3319,
        "zoom": 11,
        "bbox": [26.2, 80.1, 26.7, 80.6],
        "description": "Heavy Leather, Chemical & Defense Manufacturing"
    },
    "patna": {
        "name": "Patna",
        "state": "Bihar",
        "type": "city",
        "lat": 25.5941,
        "lon": 85.1376,
        "zoom": 10,
        "bbox": [25.4, 84.9, 25.8, 85.4],
        "description": "Capital of Bihar & Gangetic Plain"
    },
    "bhopal": {
        "name": "Bhopal",
        "state": "Madhya Pradesh",
        "type": "city",
        "lat": 23.2599,
        "lon": 77.4126,
        "zoom": 10,
        "bbox": [23.0, 77.2, 23.5, 77.7],
        "description": "Capital of Madhya Pradesh & Mandideep Industrial Area"
    },
    "indore": {
        "name": "Indore",
        "state": "Madhya Pradesh",
        "type": "city",
        "lat": 22.7196,
        "lon": 75.8577,
        "zoom": 10,
        "bbox": [22.5, 75.6, 23.0, 76.1],
        "description": "Pithampur Auto & Pharma Industrial Corridor"
    },
    "raipur": {
        "name": "Raipur",
        "state": "Chhattisgarh",
        "type": "city",
        "lat": 21.2514,
        "lon": 81.6296,
        "zoom": 11,
        "bbox": [21.0, 81.4, 21.5, 81.9],
        "description": "Capital of Chhattisgarh & Steel Rerolling Cluster"
    },
    "ranchi": {
        "name": "Ranchi",
        "state": "Jharkhand",
        "type": "city",
        "lat": 23.3441,
        "lon": 85.3096,
        "zoom": 11,
        "bbox": [23.1, 85.1, 23.6, 85.6],
        "description": "Capital of Jharkhand & HEC Industrial Zone"
    },
    "bhubaneswar": {
        "name": "Bhubaneswar",
        "state": "Odisha",
        "type": "city",
        "lat": 20.2961,
        "lon": 85.8245,
        "zoom": 11,
        "bbox": [20.1, 85.6, 20.5, 86.1],
        "description": "Capital of Odisha"
    },
    "nagpur": {
        "name": "Nagpur Industrial Hub",
        "state": "Maharashtra",
        "type": "city",
        "lat": 21.1458,
        "lon": 79.0882,
        "zoom": 10,
        "bbox": [20.9, 78.8, 21.4, 79.3],
        "description": "MIHAN Industrial Cluster & Thermal Hub"
    },
    "surat": {
        "name": "Surat Industrial Belt",
        "state": "Gujarat",
        "type": "city",
        "lat": 21.1702,
        "lon": 72.8311,
        "zoom": 11,
        "bbox": [20.8, 72.4, 21.6, 73.2],
        "description": "Textile, Diamond & Petrochemical Cluster"
    },
    "vadodara": {
        "name": "Vadodara Petrochemical Hub",
        "state": "Gujarat",
        "type": "city",
        "lat": 22.3072,
        "lon": 73.1812,
        "zoom": 11,
        "bbox": [22.1, 72.9, 22.6, 73.4],
        "description": "IOCL Gujarat Refinery & Chemical Industries"
    },
    "rajkot": {
        "name": "Rajkot Engineering Belt",
        "state": "Gujarat",
        "type": "city",
        "lat": 22.3039,
        "lon": 70.8022,
        "zoom": 11,
        "bbox": [22.1, 70.6, 22.5, 71.0],
        "description": "Diesel Engines, Auto Parts & Casting Hub"
    },
    "chandigarh": {
        "name": "Chandigarh Capital Region",
        "state": "Chandigarh",
        "type": "city",
        "lat": 30.7333,
        "lon": 76.7794,
        "zoom": 11,
        "bbox": [30.5, 76.5, 30.9, 77.0],
        "description": "Joint Capital of Punjab and Haryana"
    },
    "amritsar": {
        "name": "Amritsar",
        "state": "Punjab",
        "type": "city",
        "lat": 31.6340,
        "lon": 74.8723,
        "zoom": 11,
        "bbox": [31.4, 74.6, 31.9, 75.1],
        "description": "Border Region Agricultural & Industrial Belt"
    },
    "jalandhar": {
        "name": "Jalandhar",
        "state": "Punjab",
        "type": "city",
        "lat": 31.3260,
        "lon": 75.5762,
        "zoom": 11,
        "bbox": [31.1, 75.3, 31.6, 75.8],
        "description": "Sports Goods, Leather & Agricultural Region"
    },
    "guwahati": {
        "name": "Guwahati",
        "state": "Assam",
        "type": "city",
        "lat": 26.1445,
        "lon": 91.7362,
        "zoom": 10,
        "bbox": [25.9, 91.5, 26.4, 92.0],
        "description": "Northeast Industrial Gateway & Refinery Hub"
    },

    # States & Union Territories of India
    "punjab": {
        "name": "Punjab",
        "state": "Punjab",
        "type": "state",
        "lat": 31.1471,
        "lon": 75.3412,
        "zoom": 8,
        "bbox": [29.5, 73.8, 32.5, 76.9],
        "description": "State of Punjab (High Crop Residue & Industrial Activity)"
    },
    "haryana": {
        "name": "Haryana",
        "state": "Haryana",
        "type": "state",
        "lat": 29.0588,
        "lon": 76.0856,
        "zoom": 8,
        "bbox": [27.6, 74.4, 30.9, 77.6],
        "description": "State of Haryana (Industrial & Agricultural Corridors)"
    },
    "maharashtra": {
        "name": "Maharashtra",
        "state": "Maharashtra",
        "type": "state",
        "lat": 19.7515,
        "lon": 75.7139,
        "zoom": 7,
        "bbox": [15.6, 72.6, 22.0, 80.9],
        "description": "State of Maharashtra (Extensive Industrial Telemetry)"
    },
    "gujarat": {
        "name": "Gujarat",
        "state": "Gujarat",
        "type": "state",
        "lat": 22.2587,
        "lon": 71.1924,
        "zoom": 7,
        "bbox": [20.0, 68.1, 24.7, 74.5],
        "description": "State of Gujarat (Petrochemical, Chemical & Ports)"
    },
    "chhattisgarh": {
        "name": "Chhattisgarh",
        "state": "Chhattisgarh",
        "type": "state",
        "lat": 21.2787,
        "lon": 81.8661,
        "zoom": 7,
        "bbox": [17.7, 80.2, 24.1, 84.4],
        "description": "State of Chhattisgarh (Mining & Steel Powerhouse)"
    },
    "odisha": {
        "name": "Odisha",
        "state": "Odisha",
        "type": "state",
        "lat": 20.9517,
        "lon": 85.0985,
        "zoom": 7,
        "bbox": [17.8, 81.3, 22.6, 87.5],
        "description": "State of Odisha (Mineral & Heavy Metallurgical Belt)"
    },
    "jharkhand": {
        "name": "Jharkhand",
        "state": "Jharkhand",
        "type": "state",
        "lat": 23.6102,
        "lon": 85.2799,
        "zoom": 7,
        "bbox": [21.9, 83.3, 25.4, 87.9],
        "description": "State of Jharkhand (Coal, Iron Ore & Heavy Steel)"
    },
    "madhya pradesh": {
        "name": "Madhya Pradesh",
        "state": "Madhya Pradesh",
        "type": "state",
        "lat": 22.9734,
        "lon": 78.6569,
        "zoom": 7,
        "bbox": [21.0, 74.0, 26.9, 82.8],
        "description": "State of Madhya Pradesh (Central India Industrial Belt)"
    },
    "rajasthan": {
        "name": "Rajasthan",
        "state": "Rajasthan",
        "type": "state",
        "lat": 27.0238,
        "lon": 74.2179,
        "zoom": 7,
        "bbox": [23.0, 69.5, 30.2, 78.3],
        "description": "State of Rajasthan (Mining, Minerals & Cement Belt)"
    },
    "uttar pradesh": {
        "name": "Uttar Pradesh",
        "state": "Uttar Pradesh",
        "type": "state",
        "lat": 26.8467,
        "lon": 80.9462,
        "zoom": 7,
        "bbox": [23.8, 77.0, 30.4, 84.6],
        "description": "State of Uttar Pradesh (Agricultural & Manufacturing)"
    },
    "tamil nadu": {
        "name": "Tamil Nadu",
        "state": "Tamil Nadu",
        "type": "state",
        "lat": 11.1271,
        "lon": 78.6569,
        "zoom": 7,
        "bbox": [8.0, 76.2, 13.6, 80.4],
        "description": "State of Tamil Nadu (Automotive, Textiles & Power)"
    },
    "karnataka": {
        "name": "Karnataka",
        "state": "Karnataka",
        "type": "state",
        "lat": 15.3173,
        "lon": 75.7139,
        "zoom": 7,
        "bbox": [11.5, 74.0, 18.5, 78.6],
        "description": "State of Karnataka (Steel, Tech & Industrial Belts)"
    },
    "telangana": {
        "name": "Telangana",
        "state": "Telangana",
        "type": "state",
        "lat": 18.1124,
        "lon": 79.0193,
        "zoom": 7,
        "bbox": [15.8, 77.2, 19.9, 81.8],
        "description": "State of Telangana (Thermal Power & Pharma Clusters)"
    },
    "andhra pradesh": {
        "name": "Andhra Pradesh",
        "state": "Andhra Pradesh",
        "type": "state",
        "lat": 15.9129,
        "lon": 79.7400,
        "zoom": 7,
        "bbox": [12.6, 76.7, 19.1, 84.8],
        "description": "State of Andhra Pradesh (Coastal Industrial Corridors)"
    },
    "west bengal": {
        "name": "West Bengal",
        "state": "West Bengal",
        "type": "state",
        "lat": 22.9868,
        "lon": 87.8550,
        "zoom": 7,
        "bbox": [21.5, 85.8, 27.2, 89.9],
        "description": "State of West Bengal (Heavy Metallurgy & Ports)"
    },
    "bihar": {
        "name": "Bihar",
        "state": "Bihar",
        "type": "state",
        "lat": 25.0961,
        "lon": 85.3131,
        "zoom": 7,
        "bbox": [24.2, 83.3, 27.5, 88.3],
        "description": "State of Bihar (Agricultural & Fertilizer Plants)"
    },
    "assam": {
        "name": "Assam",
        "state": "Assam",
        "type": "state",
        "lat": 26.2006,
        "lon": 92.9376,
        "zoom": 7,
        "bbox": [24.1, 89.7, 28.0, 96.0],
        "description": "State of Assam (Oil Refineries & Petrochemical Belts)"
    },
    "kerala": {
        "name": "Kerala",
        "state": "Kerala",
        "type": "state",
        "lat": 10.8505,
        "lon": 76.2711,
        "zoom": 7,
        "bbox": [8.2, 74.8, 12.8, 77.4],
        "description": "State of Kerala (Coastal Ports & Petrochemicals)"
    },
    "himachal pradesh": {
        "name": "Himachal Pradesh",
        "state": "Himachal Pradesh",
        "type": "state",
        "lat": 31.1048,
        "lon": 77.1734,
        "zoom": 8,
        "bbox": [30.3, 75.5, 33.3, 79.0],
        "description": "State of Himachal Pradesh (Pharma & Hydro Clusters)"
    },
    "uttarakhand": {
        "name": "Uttarakhand",
        "state": "Uttarakhand",
        "type": "state",
        "lat": 30.0668,
        "lon": 79.0193,
        "zoom": 8,
        "bbox": [28.7, 77.5, 31.5, 81.1],
        "description": "State of Uttarakhand (SIDCUL Industrial Clusters)"
    },
    "goa": {
        "name": "Goa",
        "state": "Goa",
        "type": "state",
        "lat": 15.2993,
        "lon": 74.1240,
        "zoom": 9,
        "bbox": [14.9, 73.6, 15.8, 74.4],
        "description": "State of Goa (Mining & Coastal Industry)"
    },
    "jammu and kashmir": {
        "name": "Jammu and Kashmir",
        "state": "Jammu and Kashmir",
        "type": "state",
        "lat": 33.7782,
        "lon": 76.5762,
        "zoom": 7,
        "bbox": [32.2, 73.5, 37.0, 80.3],
        "description": "Union Territory of Jammu and Kashmir"
    },
    "kashmir": {
        "name": "Jammu and Kashmir",
        "state": "Jammu and Kashmir",
        "type": "state",
        "lat": 33.7782,
        "lon": 76.5762,
        "zoom": 7,
        "bbox": [32.2, 73.5, 37.0, 80.3],
        "description": "Union Territory of Jammu and Kashmir"
    },
    "ladakh": {
        "name": "Ladakh",
        "state": "Ladakh",
        "type": "state",
        "lat": 34.1526,
        "lon": 77.5771,
        "zoom": 7,
        "bbox": [32.0, 75.5, 36.5, 80.5],
        "description": "Union Territory of Ladakh"
    }
}


def normalize_query(query: str) -> str:
    """Strip common words and clean location search string."""
    q = query.strip().lower()
    for word in ["near", "in", "city", "state", "district", "region", "belt", "cluster", "area", "zone"]:
        if q.startswith(word + " "):
            q = q[len(word)+1:].strip()
        if q.endswith(" " + word):
            q = q[:-len(word)-1].strip()
    return q


def find_location(query: str) -> Optional[Dict[str, Any]]:
    """
    Search for a location by name in the gazetteer.
    Supports exact, prefix, and alias matches.
    """
    q = normalize_query(query)
    if not q:
        return None

    # 1. Exact match
    if q in INDIAN_LOCATIONS:
        return INDIAN_LOCATIONS[q]

    # 2. Check if key starts with query or query in key
    for key, loc in INDIAN_LOCATIONS.items():
        if key.startswith(q) or q in key:
            return loc

    # 3. Check within name or description
    for key, loc in INDIAN_LOCATIONS.items():
        if q in loc["name"].lower() or q in loc["state"].lower():
            return loc

    return None


def get_location_suggestions(query: str, limit: int = 6) -> List[Dict[str, Any]]:
    """
    Returns autocompletion suggestions matching the query.
    """
    q = normalize_query(query)
    if not q or len(q) < 2:
        return []

    results = []
    seen = set()

    # Prioritize prefix match
    for key, loc in INDIAN_LOCATIONS.items():
        if key.startswith(q) and loc["name"] not in seen:
            results.append(loc)
            seen.add(loc["name"])
            if len(results) >= limit:
                return results

    # Substring match
    for key, loc in INDIAN_LOCATIONS.items():
        if (q in key or q in loc["name"].lower() or q in loc["state"].lower()) and loc["name"] not in seen:
            results.append(loc)
            seen.add(loc["name"])
            if len(results) >= limit:
                return results

    return results
