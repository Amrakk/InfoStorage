import React, { useEffect, useRef, useState } from "react";

export default function OptionSelected({
    x,
    y,
    grabbing,
    setGrabbing,
    setAction,
    actions,
}: {
    x: number;
    y: number;
    grabbing: boolean;
    setGrabbing: React.Dispatch<React.SetStateAction<boolean>>;
    setAction: React.Dispatch<React.SetStateAction<number>>;
    actions: { icon: string; action: string; name: string; color: string; background: string }[];
}) {
    const [actionIndex, setActionIndex] = useState<number>(-1);
    const [sx, setSx] = useState(0);
    const [sy, setSy] = useState(0);
    const divRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasIconRef = useRef<HTMLCanvasElement>(null);
    const canvasLineRef = useRef<HTMLCanvasElement>(null);

    const canvasSize = 250;

    const startRad = Math.PI / 2;
    const radius = canvasSize / 2;

    useEffect(() => {
        render();
    }, []);

    useEffect(() => {
        if (!divRef.current) return;
        const ctx = canvasLineRef.current?.getContext("2d");
        const canvasLine = canvasLineRef.current;
        canvasLine!.width = window.innerWidth;
        canvasLine!.height = window.innerHeight;
        if (!ctx) return;

        const handleMouseMove = (e: MouseEvent) => {
            setSx(e.clientX);
            setSy(e.clientY);

            ctx.clearRect(0, 0, canvasLine!.width, canvasLine!.height);
            ctx!.beginPath();
            ctx!.moveTo(x, y);
            ctx!.lineTo(e.x, e.y);
            ctx!.strokeStyle = "#415245";
            ctx!.lineWidth = 2;
            ctx!.stroke();
            drawDefault();
            // const a = Math.atan2(yg - y, x - xg);
            let a = Math.atan2(e.y - y, e.x - x);
            //convert to degree
            a = (a * 180) / Math.PI + 90;
            if (a < 0) a = 360 + a;

            let calculatedActionIndex = Math.floor((a / 360) * actions.length);
            setActionIndex(calculatedActionIndex);
            drawDirection(calculatedActionIndex);
        };
        const handleMouseUp = () => {
            setGrabbing(false);
            if (actionIndex !== -1) {
                setAction(actionIndex);
            }
        };
        if (grabbing) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [divRef.current, grabbing, actionIndex]);

    function drawDirection(actionIndex: number) {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        ctx!.beginPath();
        ctx!.arc(
            radius,
            radius,
            radius - 2,
            ((2 * Math.PI) / actions.length) * actionIndex - Math.PI / 2,
            ((2 * Math.PI) / actions.length) * (actionIndex + 1) - Math.PI / 2
        );
        ctx!.strokeStyle = actions[actionIndex].color;
        ctx!.lineWidth = 3; //Độ rộng
        ctx!.stroke();
        ctx!.lineTo(radius, radius);

        // Create a radial gradient for the fill color
        const gradient = ctx!.createRadialGradient(radius, radius, 50, radius, radius, 120);
        // gradient.addColorStop(0, actions[actionIndex].background); // Gray color at 1/3 distance
        gradient.addColorStop(0.6, actions[actionIndex].background);
        gradient.addColorStop(1, `${actions[actionIndex].background}5F`); // End color (outer)
        ctx!.fillStyle = gradient; // Change the color as needed
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(radius, radius, 50, 0, 2 * Math.PI);
        ctx!.strokeStyle = actions[actionIndex].color;
        ctx!.lineWidth = 3; //Độ rộng
        ctx!.stroke();

        drawHole();
    }

    function drawDefault() {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        // Clear the canvas
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ctx!.beginPath();
        ctx!.arc(radius, radius, radius - 2, 0, 2 * Math.PI);
        ctx!.strokeStyle = "#415245";
        ctx!.lineWidth = 2; //Độ rộng
        ctx!.stroke();

        // Create a radial gradient for the fill color
        const gradient = ctx!.createRadialGradient(radius, radius, 50, radius, radius, 120);
        gradient.addColorStop(0, "rgba(229, 231, 235, 1)"); // Gray color at 1/3 distance
        gradient.addColorStop(1, "rgba(229, 231, 235, 0.1)"); // End color (outer)
        ctx!.fillStyle = gradient; // Change the color as needed
        ctx!.fill();

        for (let i = 0; i < actions.length; i++) {
            const a = ((2 * Math.PI) / actions.length) * i + startRad;
            const X = radius + (radius - 2) * Math.cos(a);
            const Y = radius - (radius - 2) * Math.sin(a);
            ctx!.beginPath();
            ctx!.moveTo(radius, radius);
            ctx!.lineTo(X, Y);
            ctx!.strokeStyle = "#415245";
            ctx!.lineWidth = 1;
            ctx!.stroke();
        }

        // draw a line to the center of the circle and it follow to the mouse

        drawHole();
    }

    function drawHole() {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        const gradient = ctx!.createRadialGradient(radius, radius, 50, radius, radius, 110);
        gradient.addColorStop(0, "black"); // Gray color at 1/3 distance
        gradient.addColorStop(1, "transparent"); // End color (outer)

        ctx!.beginPath();
        ctx!.lineTo(radius, radius);
        ctx!.fillStyle = gradient;
        ctx!.fill();

        // Clear the inner circle to make it transparent
        ctx!.globalCompositeOperation = "destination-out";
        ctx!.beginPath();
        ctx!.arc(radius, radius, 50, 0, 2 * Math.PI);
        ctx!.fill();

        ctx!.globalCompositeOperation = "source-over";
    }

    function drawIcon() {
        if (!canvasIconRef.current) return;

        const ctxIcon = canvasIconRef.current.getContext("2d");
        if (!ctxIcon) return;

        // Clear the canvas
        ctxIcon.clearRect(0, 0, 300, 300);
        for (let i = 0; i < actions.length; i++) {
            const a = -((2 * Math.PI) / actions.length) * i + startRad - Math.PI / actions.length;
            const X = radius + (radius / 1.5) * Math.cos(a);
            const Y = radius - (radius / 1.5) * Math.sin(a);

            const img = new Image();
            img.src = actions[i].icon;
            img.onload = () => {
                ctxIcon!.drawImage(img, X - 20, Y - 20, 40, 40);
            };
        }
    }
    const render = () => {
        if (!canvasRef.current || !canvasIconRef.current) return;

        // drawDefault();
        drawIcon();
    };

    return (
        <div
            ref={divRef}
            className="size-max fixed inset-0 overflow-hidden"
            style={{
                width: grabbing ? "auto" : "0",
                height: grabbing ? "auto" : "0",
            }}
        >
            <canvas
                id="canvas"
                width={canvasSize}
                height={canvasSize}
                style={{
                    // position: "absolute",
                    left: `${x - radius}px`,
                    top: `${y - radius}px`,
                    // border: "2px solid #415245",
                }}
                ref={canvasRef}
            ></canvas>
            <canvas
                id="canvasIcon"
                width={300}
                height={300}
                style={{
                    // position: "absolute",
                    left: `${x - canvasSize / 2}px`,
                    top: `${y - canvasSize / 2}px`,
                }}
                ref={canvasIconRef}
            ></canvas>
            <canvas
                ref={canvasLineRef}
                style={{
                    inset: 0,
                }}
            ></canvas>
        </div>
    );
}
