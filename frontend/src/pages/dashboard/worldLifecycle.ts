// Kept outside the 3D bundle so failure can select the lightweight view first.
export function probeWorldCanvas(createCanvas: () => Pick<HTMLCanvasElement, 'getContext'> = () => document.createElement('canvas')): boolean {
    try {
        const canvas = createCanvas();
        const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
        if (!gl)
            return false;
        (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
        return true;
    }
    catch {
        return false;
    }
}
