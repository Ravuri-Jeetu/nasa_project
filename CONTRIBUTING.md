# Contributing to Space Biology Research Platform

Thank you for your interest in contributing to the Space Biology Research Platform! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.8+ with pip
- Git

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Frontend.git`
3. Run the setup script: `setup.bat` (Windows) or follow manual setup in README.md
4. Start development servers: `start-dev.bat`

## 🛠️ Development Guidelines

### Code Style
- **Frontend**: Use TypeScript, follow ESLint rules, use Tailwind CSS for styling
- **Backend**: Follow PEP 8, use type hints, document functions with docstrings
- **Commits**: Use conventional commit messages with emojis

### Project Structure
```
Frontend/
├── cursor-back/          # FastAPI Backend
│   ├── main.py          # Main API server
│   ├── data_processor.py # Data processing logic
│   └── requirements.txt  # Python dependencies
├── cursor-front/        # Next.js Frontend
│   ├── src/
│   │   ├── app/         # App Router pages
│   │   ├── components/  # React components
│   │   └── api/         # API client functions
│   └── package.json     # Node.js dependencies
└── README.md           # Project documentation
```

## 🎯 Areas for Contribution

### High Priority
- [ ] **Performance Optimization**: Improve data loading and rendering speed
- [ ] **Mobile Responsiveness**: Enhance mobile experience
- [ ] **Testing**: Add unit and integration tests
- [ ] **Documentation**: Improve API documentation and user guides

### Feature Requests
- [ ] **Advanced Analytics**: More sophisticated data analysis algorithms
- [ ] **Export Functionality**: PDF/Excel export for reports
- [ ] **User Authentication**: Role-based access control
- [ ] **Real-time Updates**: WebSocket integration for live data
- [ ] **Data Visualization**: Additional chart types and interactive features

### Bug Fixes
- [ ] Check the Issues tab for open bugs
- [ ] Look for "good first issue" labels for beginner-friendly tasks
- [ ] Test edge cases and error handling

## 📝 Pull Request Process

### Before Submitting
1. **Test your changes**: Ensure all features work correctly
2. **Check for linting errors**: Run `pnpm lint` (frontend) and `flake8` (backend)
3. **Update documentation**: Update README.md if needed
4. **Add tests**: Include tests for new functionality

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Backend tests pass
- [ ] Frontend tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented if necessary)
```

## 🧪 Testing

### Frontend Testing
```bash
cd cursor-front
pnpm test          # Run tests
pnpm lint          # Check code style
pnpm type-check    # TypeScript validation
```

### Backend Testing
```bash
cd cursor-back
source venv/bin/activate  # Activate virtual environment
python -m pytest          # Run tests
flake8 .                  # Check code style
```

## 📊 Data Processing

### Adding New Analytics
1. **Backend**: Extend `data_processor.py` with new analysis functions
2. **API**: Add new endpoints in `main.py`
3. **Frontend**: Create components in `src/components/`
4. **Integration**: Update API client in `src/api/api.ts`

### CSV Data Format
Ensure CSV files follow the expected format:
- **SB_publication_PMC.csv**: Title, Link columns required
- **Taskbook_cleaned_for_NLP.csv**: Title, Abstract, Methods, Results, Conclusion columns

## 🤖 AI Integration

### Adding New AI Features
1. **Models**: Add new Hugging Face models to requirements.txt
2. **Processing**: Implement in `main.py` with proper error handling
3. **Frontend**: Create UI components for AI interactions
4. **Caching**: Consider caching for expensive AI operations

## 🎨 UI/UX Guidelines

### Design System
- **Colors**: Use Tailwind CSS color palette
- **Components**: Leverage shadcn/ui components
- **Responsiveness**: Mobile-first design approach
- **Accessibility**: Follow WCAG guidelines

### Component Structure
```typescript
// Example component structure
interface ComponentProps {
  // Props with TypeScript types
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return (
    // JSX with proper accessibility attributes
  );
}
```

## 🐛 Bug Reports

### Reporting Bugs
1. Check existing issues first
2. Use the bug report template
3. Include:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots if applicable

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node.js version: [e.g., 18.17.0]
- Python version: [e.g., 3.9.7]

## Additional Context
Any other context about the problem
```

## 💡 Feature Requests

### Suggesting Features
1. Check existing feature requests
2. Use the feature request template
3. Explain the use case and benefits
4. Consider implementation complexity

## 📚 Documentation

### Contributing to Documentation
- **README.md**: Update setup instructions and feature descriptions
- **API Documentation**: Update endpoint descriptions in `main.py`
- **Code Comments**: Add inline comments for complex logic
- **Type Definitions**: Ensure TypeScript interfaces are well-documented

## 🔒 Security

### Security Guidelines
- **Dependencies**: Keep all dependencies updated
- **API Keys**: Never commit API keys or sensitive data
- **Input Validation**: Validate all user inputs
- **Error Handling**: Don't expose sensitive information in errors

## 📞 Support

### Getting Help
- **GitHub Issues**: Use for bugs and feature requests
- **Discussions**: Use for questions and general discussion
- **Documentation**: Check README.md and inline code comments

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributor statistics

Thank you for contributing to the Space Biology Research Platform! 🌟
