'use client';

import React from 'react';
import Image from 'next/image';

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

	function toThumbnailUrl(originalUrl: string | null | undefined, width: number = 960, quality: number = 70): string | null {
		if (!originalUrl) return null;
		try {
			const publicToken = '/storage/v1/object/public/';
			const signToken = '/storage/v1/object/sign/';
			if (originalUrl.includes(publicToken)) {
				return originalUrl
					.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
					.concat(originalUrl.includes('?') ? `&width=${width}&quality=${quality}` : `?width=${width}&quality=${quality}`);
			}
			if (originalUrl.includes(signToken)) {
				return originalUrl
					.replace('/storage/v1/object/sign/', '/storage/v1/render/image/sign/')
					.concat(originalUrl.includes('?') ? `&width=${width}&quality=${quality}` : `?width=${width}&quality=${quality}`);
			}
			return originalUrl;
		} catch {
			return originalUrl;
		}
	}

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
											<div className="ui-timeline-image-wrap">
												<Image
													fill
													src={toThumbnailUrl((it.imageUrl ?? (it as any).image_url) as string) as string}
													alt={it.title}
													sizes="(max-width: 640px) 100vw, (max-width: 900px) 80vw, 50vw"
													style={{ objectFit: 'cover' }}
													priority={idx < 2}
													unoptimized={true}
												/>
											</div>
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
											<div className="ui-timeline-image-wrap">
												<Image
													fill
													src={toThumbnailUrl((it.imageUrl ?? (it as any).image_url) as string) as string}
													alt={it.title}
													sizes="(max-width: 640px) 100vw, (max-width: 900px) 80vw, 50vw"
													style={{ objectFit: 'cover' }}
													priority={idx < 2}
													unoptimized={true}
												/>
											</div>
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


