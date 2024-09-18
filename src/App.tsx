import { useState, ChangeEvent, FormEvent } from 'react';

interface ProcessedFile {
  name: string;
  downloadUrl: string;
}

const App: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<FileList | null>(null);
  const [tocType, setTocType] = useState<string>('none');
  const [tocStartPageNum, setTocStartPageNum] = useState<number | ''>('');
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [pdfFileName, setPdfFileName] = useState<string>('Выберите PDF-файлы');

  const handlePdfChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setPdfFiles(event.target.files);
      setPdfFileName(Array.from(event.target.files).map(file => file.name).join(', '));
    }
  };

  const handleTocTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setTocType(event.target.value);
  };

  const handlePageNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTocStartPageNum(Number(event.target.value) || '');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!pdfFiles || tocType === undefined || tocStartPageNum === undefined) {
      alert("Заполните все поля.");
      return;
    }

    const formData = new FormData();
    if (pdfFiles) {
      for (let i = 0; i < pdfFiles.length; i++) {
        formData.append('pdf_files', pdfFiles[i]);
      }
    }
    formData.append('toc_type', tocType);
    formData.append('toc_start_page_num', tocStartPageNum.toString());

    try {
      // ПОМЕНЯЙ ПУСТЬ И ВРОДЕ ДОЛЖНО РАБОТАТЬ
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Ошибка при загрузке файлов.");
      }

      const data = await response.json();
      setProcessedFiles(data.processedFiles);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="container">
      <h1>Добавление оглавления в PDF-файлы</h1>
      <form onSubmit={handleSubmit}>
        <div className="block">
          <label htmlFor="pdfFiles">Загрузите PDF-файлы:</label>
          <input
            type="file"
            id="pdfFiles"
            accept="application/pdf"
            multiple
            onChange={handlePdfChange}
          />
          <label htmlFor="pdfFiles" className="custom-file-upload">
            <span>{pdfFileName}</span>
          </label>
        </div>
        <div className="block">
          <label htmlFor="tocType">Выберите тип оглавления:</label>
          <select id="tocType" value={tocType} onChange={handleTocTypeChange}>
            <option value="none">Нет оглавления</option>
            <option value="doc_type">Oглавление в боковой панели PDF</option>
            <option value="page_type">Oглавление на странице PDF</option>
          </select>
        </div>
        <div className="block">
          <label htmlFor="tocStartPageNum">Введите номер начальной страницы оглавления:</label>
          <input
            type="text"
            id="tocStartPageNum"
            value={tocStartPageNum}
            onChange={handlePageNumberChange}
            placeholder="Например, 1"
          />
        </div>
        <button type="submit">Загрузить и обновить оглавление</button>
      </form>

      {processedFiles.length > 0 && (
        <div>
          <h2>Обработанные файлы</h2>
          <p>Скачайте PDF-файлы с обновлённым оглавлением.</p>
          <ul>
            {processedFiles.map((file, index) => (
              <li key={index}>
                Обновлённый файл: {file.name}
                <a href={file.downloadUrl} download>
                  <button>Скачать</button>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;