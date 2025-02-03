import {
  executeConditionalPromptChain,
  promptManagerFactory,
} from './controlFlow'

describe('executeConditionalPromptChain', () => {
  it('should execute all prompts where the predicate is true', async () => {
    // Mock prompts
    const mockPrompt1 = {
      predicate: jest.fn().mockReturnValue(true),
      userInputFlow: jest.fn().mockResolvedValue({ success: true }),
    }

    const mockPrompt2 = {
      predicate: jest.fn().mockReturnValue(false),
      userInputFlow: jest.fn().mockResolvedValue({ success: true }),
    }

    const mockPrompt3 = {
      predicate: jest.fn().mockReturnValue(true),
      userInputFlow: jest.fn().mockResolvedValue({ success: true }),
    }

    // Call the function with mocked prompts
    await executeConditionalPromptChain([mockPrompt1, mockPrompt2, mockPrompt3])

    // Verify behavior
    expect(mockPrompt1.predicate).toHaveBeenCalledTimes(1)
    expect(mockPrompt1.userInputFlow).toHaveBeenCalledTimes(1)

    expect(mockPrompt2.predicate).toHaveBeenCalledTimes(1)
    expect(mockPrompt2.userInputFlow).not.toHaveBeenCalled()

    expect(mockPrompt3.predicate).toHaveBeenCalledTimes(1)
    expect(mockPrompt3.userInputFlow).toHaveBeenCalledTimes(1)
  })

  it('should throw an error if any prompt userInputFlow returns success as false', async () => {
    const mockPrompt1 = {
      predicate: jest.fn().mockReturnValue(true),
      userInputFlow: jest.fn().mockResolvedValue({ success: true }),
    }

    const mockPrompt2 = {
      predicate: jest.fn().mockReturnValue(true),
      userInputFlow: jest.fn().mockResolvedValue({ success: false }),
    }

    await expect(
      executeConditionalPromptChain([mockPrompt1, mockPrompt2]),
    ).rejects.toEqual({ success: false })

    expect(mockPrompt1.userInputFlow).toHaveBeenCalledTimes(1)
    expect(mockPrompt2.userInputFlow).toHaveBeenCalledTimes(1)
  })

  it('should skip prompts where predicate returns false', async () => {
    const mockPrompt1 = {
      predicate: jest.fn().mockReturnValue(false),
      userInputFlow: jest.fn().mockResolvedValue({ success: true }),
    }

    const mockPrompt2 = {
      predicate: jest.fn().mockReturnValue(true),
      userInputFlow: jest.fn().mockResolvedValue({ success: true }),
    }

    await executeConditionalPromptChain([mockPrompt1, mockPrompt2])

    expect(mockPrompt1.userInputFlow).not.toHaveBeenCalled()
    expect(mockPrompt2.userInputFlow).toHaveBeenCalledTimes(1)
  })

  it('should handle an empty prompt array without errors', async () => {
    await expect(executeConditionalPromptChain([])).resolves.toBeUndefined()
  })
})

describe('promptManagerFactory', () => {
  let mockNavFn
  let screenName
  let routeParams

  beforeEach(() => {
    mockNavFn = jest.fn()
    screenName = 'AddEmergencyContact'
    routeParams = { action: 'add', availableContacts: 2 }
  })

  it('should add receiver to the list and resolve the promise when send is called', async () => {
    const promptManager = promptManagerFactory(
      screenName,
      mockNavFn,
      routeParams,
    )

    const showPromise = promptManager.show()

    expect(mockNavFn).toHaveBeenCalledTimes(1)

    const message = { success: true }

    promptManager.send(1, message)

    const result = await showPromise

    expect(result).toEqual(message)
  })

  it('should not throw if send is called with an id that does not exist', () => {
    const promptManager = promptManagerFactory(
      screenName,
      mockNavFn,
      routeParams,
    )

    expect(() => {
      promptManager.send(999, { success: false })
    }).not.toThrow()
  })

  it('should remove receiver after resolving the promise', async () => {
    const promptManager = promptManagerFactory(
      screenName,
      mockNavFn,
      routeParams,
    )

    const showPromise = promptManager.show()

    const message = { success: true }
    promptManager.send(1, message)

    await showPromise

    expect(() => {
      promptManager.send(1, message)
    }).not.toThrow()
  })
})
