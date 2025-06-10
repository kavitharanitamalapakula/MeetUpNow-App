import { useState, useEffect } from 'react';
import "../styles/carousel.css"

const carouselItems = [
    {
        title: 'Get a link that you can share',
        description: 'Click New meeting to get a link you can send to people you want to meet with.',
        image: 'https://www.gstatic.com/meet/user_edu_get_a_link_light_90698cd7b4ca04d3005c962a3756c42d.svg',
    },
    {
        title: 'Plan ahead',
        description: 'Schedule a meeting and share the invite with participants in advance.',
        image: 'https://www.gstatic.com/meet/user_edu_scheduling_light_b352efa017e4f8f1ffda43e847820322.svg',
    },
    {
        title: 'Start an instant meeting',
        description: 'Create a meeting and start right away with a single click.',
        image: 'https://www.gstatic.com/meet/user_edu_safety_light_e04a2bbb449524ef7e49ea36d5f25b65.svg',
    },
];

function Carousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);

    useEffect(() => {
        const interval = setInterval(() => {
            next();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="custom-carousel">
            <div className="carousel-innerd-flex justify-content-center align-items-center flex-column text-center">
                <img src={carouselItems[currentIndex].image} className="carousel-image mb-3" alt="carousel" />
                <h5>{carouselItems[currentIndex].title}</h5>
                <p>{carouselItems[currentIndex].description}</p>
            </div>
        </div>
    );
}

export default Carousel;
