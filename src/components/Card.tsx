import React from 'react';

interface CardProps {
	word?: string;
}

const Card: React.FC<CardProps> = ({ word }) => {
	return (
		<div className={`card`}>
			{word}
		</div>
	);
};

export default Card;