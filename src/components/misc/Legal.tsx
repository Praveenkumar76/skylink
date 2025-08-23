import { FaGithub } from "react-icons/fa";

export default function Legal() {
    return (
        <footer className="legal">
            <ul className="legal-links">
                <li>
                    <a href="https://github.com/Praveenkumar76/skylink" target="_blank">
                        Terms of Service |
                    </a>
                </li>
                <li>
                    <a href="https://github.com/Praveenkumar76/skylink" target="_blank">
                        Privacy Policy
                    </a>
                </li>
                <li>
                    <a href="https://github.com/Praveenkumar76/skylink" target="_blank">
                        Cookie Policy |
                    </a>
                </li>
                <li>
                    <a href="https://github.com/Praveenkumar76/skylink" target="_blank">
                        Accessibility
                    </a>
                </li>
            </ul>
            <div className="copy">
                <a href="https://praveenkumar76.github.io" target="_blank">
                    &copy; 2025 | Praveen Kumar
                </a>
                <a href="https://github.com/Praveenkumar76" target="_blank">
                    <FaGithub className="github" />
                </a>
            </div>
        </footer>
    );
}
