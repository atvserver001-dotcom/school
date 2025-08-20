'use client';

import React from 'react';

export interface HistoryTimelineItem {
	id?: string | number;
	date: string; // YYYY-MM-DD or YYYY
	title: string;
	content?: string;
	imageUrl?: string | null;
}

export interface HistoryTimelineProps {
	items: HistoryTimelineItem[];
	className?: string;
	onEdit?: (item: HistoryTimelineItem) => void;
	onDelete?: (item: HistoryTimelineItem) => void;
}

function getYear(date: string): string {
	// 지원: YYYY, YYYY-MM, YYYY-MM-DD
	return (date || '').slice(0, 4);
}

export default function HistoryTimeline({ items, className, onEdit, onDelete }: HistoryTimelineProps) {
	// 최신 연도가 위로 오도록 정렬 (내림차순)
	const sorted = [...items].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

	let prevYear: string | null = null;

	return (
		<div className={`ui-timeline ${className ?? ''}`}>
			<div className="ui-timeline-line" aria-hidden="true" />
			<div className="ui-timeline-body">
				{sorted.map((it, idx) => {
					const year = getYear(it.date);
					const isLeft = idx % 2 === 0; // 좌우 번갈아가며 배치
					const showYear = year && year !== prevYear;
					prevYear = year;

					return (
						<div key={it.id ?? `${it.date}-${idx}`} className="ui-timeline-row">
							{/* 왼쪽 영역 */}
							<div className={`ui-timeline-col ${isLeft ? 'content' : 'spacer'}`}>
								{isLeft && (
									<div className="ui-timeline-item">
										{it.date && <div className="ui-timeline-date">{it.date}</div>}
										<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
											<div className="ui-timeline-title">{it.title}</div>
											<div style={{ display: 'flex', gap: 8 }}>
												{onEdit && (
													<button type="button" className="ui-button outline" onClick={() => onEdit(it)}>
														편집
													</button>
												)}
												{onDelete && (
													<button
														type="button"
														className="ui-button outline"
														style={{ borderColor: '#ef4444', color: '#ef4444' }}
														onClick={() => onDelete(it)}
													>
														삭제
													</button>
												)}
											</div>
										</div>
										{it.content && <div className="ui-timeline-text">{it.content}</div>}
										{(it.imageUrl ?? (it as any).image_url) && (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={(it.imageUrl ?? (it as any).image_url) as string} alt={it.title} className="ui-timeline-image" />
										)}
									</div>
								)}
							</div>

							{/* 중앙 포인트 및 연도 표시 */}
							<div className="ui-timeline-center">
								<div className="ui-timeline-dot" aria-hidden="true" />
								{showYear && <div className="ui-timeline-year">{year}</div>}
							</div>

							{/* 오른쪽 영역 */}
							<div className={`ui-timeline-col ${!isLeft ? 'content' : 'spacer'}`}>
								{!isLeft && (
									<div className="ui-timeline-item">
										{it.date && <div className="ui-timeline-date">{it.date}</div>}
										<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
											<div className="ui-timeline-title">{it.title}</div>
											<div style={{ display: 'flex', gap: 8 }}>
												{onEdit && (
													<button type="button" className="ui-button outline" onClick={() => onEdit(it)}>
														편집
													</button>
												)}
												{onDelete && (
													<button
														type="button"
														className="ui-button outline"
														style={{ borderColor: '#ef4444', color: '#ef4444' }}
														onClick={() => onDelete(it)}
													>
														삭제
													</button>
												)}
											</div>
										</div>
										{it.content && <div className="ui-timeline-text">{it.content}</div>}
										{(it.imageUrl ?? (it as any).image_url) && (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={(it.imageUrl ?? (it as any).image_url) as string} alt={it.title} className="ui-timeline-image" />
										)}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}


