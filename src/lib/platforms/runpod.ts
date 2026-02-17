export interface RunPodJobParams {
    prompt: string;
    width?: number;
    height?: number;
    num_inference_steps?: number;
    seed?: number;
    [key: string]: any;
}

export async function submitRunPodJob(endpointId: string, input: RunPodJobParams) {
    const apiKey = process.env.RUNPOD_API_KEY;
    if (!apiKey) throw new Error('RUNPOD_API_KEY is not set');

    const url = `https://api.runpod.ai/v2/${endpointId}/run`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ input }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`RunPod submission failed: ${error}`);
    }

    return await response.json();
}

export async function checkRunPodStatus(endpointId: string, jobId: string) {
    const apiKey = process.env.RUNPOD_API_KEY;
    if (!apiKey) throw new Error('RUNPOD_API_KEY is not set');

    const url = `https://api.runpod.ai/v2/${endpointId}/status/${jobId}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`RunPod status check failed: ${error}`);
    }

    return await response.json();
}
