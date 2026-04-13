export default function PhoneMockup({ videoSrc }) {
    return (
        <div className="phone-3d">
            <div className="phone-shadow" />

            <div className="phone-body">
                <div className="phone-side phone-side-left-1" />
                <div className="phone-side phone-side-left-2" />
                <div className="phone-side phone-side-right-1" />

                <div className="phone-screen-shell">
                    <div className="phone-notch" />
                    <div className="phone-camera" />

                    <div className="phone-screen">
                        <video
                            src={videoSrc}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}