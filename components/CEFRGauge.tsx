// components/CEFRGauge.tsx
import * as d3 from "d3-shape";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { G, Line, Path, Text as SvgText } from "react-native-svg";

const CEFR_LEVELS = ["pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
const STEPS_PER_LEVEL = 5; // .0, .1, .2, .3, .4

interface Props {
    currentLevel: string;
}

// Calcola la posizione numerica della lancetta considerando anche il sottolivello
function getNeedlePosition(level: string) {
    const parts = level.split(".");
    const base = parts[0];                     // "pre-A1"
    const sub = parts[1] ? parseInt(parts[1]) : 0; // 0 se assente
    const baseIndex = CEFR_LEVELS.indexOf(base);
    if (baseIndex === -1) return 0;

    // posizione fra 0 e CEFR_LEVELS.length - 1
    return baseIndex + sub / STEPS_PER_LEVEL;
}
/*
function generateProgressPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    // path semplice: M puntoInizio -> A arco -> L centro -> Z chiude
    return `M ${x1},${y1} A ${radius},${radius} 0 0,1 ${x2},${y2} L ${cx},${cy} Z`;
}
*/
function generateRingArcPath(cx: number, cy: number, outerRadius: number, innerRadius: number, startAngle: number, endAngle: number) {
    // punti esterni
    const x1 = cx + outerRadius * Math.cos(startAngle);
    const y1 = cy + outerRadius * Math.sin(startAngle);
    const x2 = cx + outerRadius * Math.cos(endAngle);
    const y2 = cy + outerRadius * Math.sin(endAngle);

    // punti interni
    const x3 = cx + innerRadius * Math.cos(endAngle);
    const y3 = cy + innerRadius * Math.sin(endAngle);
    const x4 = cx + innerRadius * Math.cos(startAngle);
    const y4 = cy + innerRadius * Math.sin(startAngle);

    // large-arc-flag
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    // path a ciambella
    return `M ${x1},${y1} A ${outerRadius},${outerRadius} 0 ${largeArcFlag},1 ${x2},${y2} L ${x3},${y3} A ${innerRadius},${innerRadius} 0 ${largeArcFlag},0 ${x4},${y4} Z`;
}

export const CEFRGauge: React.FC<Props> = ({ currentLevel }) => {
    const width = 400;
    const height = 200;
    const radius = 150;

    const angleStep = Math.PI / (CEFR_LEVELS.length - 1);
    const position = getNeedlePosition(currentLevel);
    const needleAngle = -Math.PI + position * angleStep;

    console.log("needleAngle", needleAngle)

    const progressPath = generateRingArcPath(0, 0, radius, radius - 30, -Math.PI, needleAngle);
    console.log("progressPath", progressPath);
    return (
        <View style={styles.container}>
            <Svg width={width} height={height}>
                <G x={width / 2} y={height - 10}>
                    {/* Segmenti arco */}
                    {CEFR_LEVELS.slice(0, -1).map((level, i) => {
                        const startAngle = -Math.PI / 2 + i * angleStep;
                        const endAngle = startAngle + angleStep;

                        const path = d3
                            .arc()({
                                innerRadius: radius - 30,
                                outerRadius: radius,
                                startAngle,
                                endAngle,
                            })!;

                        // se la lancetta è oltre l’inizio del segmento -> azzurro
                        const filled = needleAngle >= endAngle;

                        return (
                            <Path
                                key={level}
                                d={path}
                                fill={filled ? "#3498db" : "#ddd"}
                                stroke="#fff"
                                strokeWidth={1}
                            />
                        );
                    })}

                    {/* Lancetta */}
                    <Line
                        x1={0}
                        y1={0}
                        x2={Math.cos(needleAngle) * (radius - 10)}
                        y2={Math.sin(needleAngle) * (radius - 10)}
                        stroke="#e74c3c"
                        strokeWidth={4}
                    />

                    {/* Etichette */}
                    {CEFR_LEVELS.map((level, i) => {
                        const angle = -Math.PI + i * angleStep;
                        const x = Math.cos(angle) * (radius + 20);
                        const y = Math.sin(angle) * (radius + 20);
                        return (
                            <SvgText
                                key={level}
                                x={x}
                                y={y}
                                fontSize={12}
                                fill={level === currentLevel.split(".")[0] ? "#3498db" : "#333"}
                                textAnchor="middle"
                                alignmentBaseline="middle"
                            >
                                {level}
                            </SvgText>
                        );
                    })}
                    <Path d={progressPath} fill="#3498db" />

                </G>
            </Svg>
            <Text style={styles.label}>CEFR Level: {currentLevel}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: "center", marginVertical: 20 },
    label: { marginTop: 10, fontSize: 14, fontWeight: "bold" },
});

export default CEFRGauge;
