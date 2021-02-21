import axios from 'axios'

export const request = async() => {
    const payload = {
        "input": [{
            "type": "remote",
            "source": "http://18.159.111.148:9001/Master_Wizr.pptx"
        }],
        "conversion": [{
            "target": "png"
        }]
    }
    try {
        const result = await axios({
            method: 'POST',
            url: 'https://api2.online-convert.com/jobs',
            data: payload,
            headers: {
                "x-oc-api-key": process.env.ONLINE_CONVERT
            }
        });
        // console.log(result.data)
        if(result.status === 201) {
            return result.data
        }
    } catch(e) {
        console.log(e)
    }
}