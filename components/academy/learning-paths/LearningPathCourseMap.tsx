import type { AcademyLearningPathNode } from "@/types/academy";
import { LearningPathCourseNode } from "./LearningPathCourseNode";

type LearningPathCourseMapProps = {
  learningPathId: string;
  nodes: AcademyLearningPathNode[];
};

export function LearningPathCourseMap({
  learningPathId,
  nodes,
}: LearningPathCourseMapProps) {
  return (
    <section className="learning-path-map" aria-labelledby="path-map-title">
      <div className="academy-section-heading">
        <div>
          <span className="section-kicker">Ordered curriculum</span>
          <h2 id="path-map-title">Your course map</h2>
        </div>
        <p>
          Course states and lock reasons are provided in text and do not rely on
          color alone.
        </p>
      </div>
      <ol aria-label="Learning path course sequence">
        {nodes.map((node, index) => (
          <LearningPathCourseNode
            key={node.course.id}
            learningPathId={learningPathId}
            node={node}
            position={index + 1}
          />
        ))}
      </ol>
    </section>
  );
}
