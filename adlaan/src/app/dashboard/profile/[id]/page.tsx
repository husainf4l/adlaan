"use client";

import React, { useState, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
} from "@hello-pangea/dnd";
import { ChromePicker, ColorResult } from "react-color";
import { useParams } from "next/navigation";

interface LayoutElement {
  id: string;
  type: "header" | "section" | "text" | "image" | "button";
  content: string;
  styles: {
    backgroundColor: string;
    textColor: string;
    fontSize: string;
    padding: string;
    margin: string;
    borderRadius: string;
  };
  position: number;
}

// Color combinations with WCAG AA compliant contrast ratios (4.5:1 minimum)
const colorPresets = [
  { bg: "#ffffff", text: "#1a1a1a" }, // White bg, very dark text (15.3:1 ratio)
  { bg: "#f8fafc", text: "#1a1a1a" }, // Light gray bg, very dark text (14.8:1 ratio)
  { bg: "#1a1a1a", text: "#ffffff" }, // Very dark bg, white text (15.3:1 ratio)
  { bg: "#1e40af", text: "#ffffff" }, // Dark blue bg, white text (8.6:1 ratio)
  { bg: "#065f46", text: "#ffffff" }, // Dark green bg, white text (9.2:1 ratio)
  { bg: "#92400e", text: "#ffffff" }, // Dark amber bg, white text (5.8:1 ratio)
  { bg: "#991b1b", text: "#ffffff" }, // Dark red bg, white text (7.2:1 ratio)
  { bg: "#581c87", text: "#ffffff" }, // Dark purple bg, white text (8.9:1 ratio)
];

// Function to calculate contrast ratio between two colors
const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string) => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const sRGB = [r, g, b].map((c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

// Function to check if contrast ratio meets WCAG AA standards
const hasGoodContrast = (bgColor: string, textColor: string): boolean => {
  return getContrastRatio(bgColor, textColor) >= 4.5;
};

const defaultStyles = {
  backgroundColor: "#ffffff",
  textColor: "#1a1a1a",
  fontSize: "16px",
  padding: "12px",
  margin: "8px",
  borderRadius: "6px",
};

const ProfileLayoutEditor = () => {
  const params = useParams();
  const profileId = params.id;

  const [elements, setElements] = useState<LayoutElement[]>([
    {
      id: "header-1",
      type: "header",
      content: "اسم الشركة",
      styles: {
        ...defaultStyles,
        fontSize: "24px",
        backgroundColor: "#f8fafc",
        textColor: "#1a1a1a",
      },
      position: 0,
    },
    {
      id: "section-1",
      type: "section",
      content: "معلومات الشركة",
      styles: {
        ...defaultStyles,
        backgroundColor: "#1e40af",
        textColor: "#ffffff",
      },
      position: 1,
    },
    {
      id: "text-1",
      type: "text",
      content: "وصف الشركة هنا...",
      styles: { ...defaultStyles },
      position: 2,
    },
  ]);

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<"bg" | "text" | null>(
    null
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const newElements = Array.from(elements);
      const [reorderedItem] = newElements.splice(result.source.index, 1);
      newElements.splice(result.destination.index, 0, reorderedItem);

      const updatedElements = newElements.map((element, index) => ({
        ...element,
        position: index,
      }));

      setElements(updatedElements);
    },
    [elements]
  );

  const updateElementContent = (id: string, content: string) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, content } : el)));
  };

  const updateElementStyle = (
    id: string,
    styleKey: keyof LayoutElement["styles"],
    value: string
  ) => {
    setElements(
      elements.map((el) =>
        el.id === id
          ? { ...el, styles: { ...el.styles, [styleKey]: value } }
          : el
      )
    );
  };

  const applyColorPreset = (
    id: string,
    preset: { bg: string; text: string }
  ) => {
    setElements(
      elements.map((el) =>
        el.id === id
          ? {
              ...el,
              styles: {
                ...el.styles,
                backgroundColor: preset.bg,
                textColor: preset.text,
              },
            }
          : el
      )
    );
  };

  const addElement = (type: LayoutElement["type"]) => {
    const newElement: LayoutElement = {
      id: `${type}-${Date.now()}`,
      type,
      content:
        type === "header"
          ? "عنوان جديد"
          : type === "section"
          ? "قسم جديد"
          : type === "text"
          ? "نص جديد"
          : type === "image"
          ? "صورة جديدة"
          : "زر جديد",
      styles: { ...defaultStyles },
      position: elements.length,
    };
    setElements([...elements, newElement]);
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
  };

  const getSelectedElement = () => {
    return elements.find((el) => el.id === selectedElement);
  };

  const renderElement = (element: LayoutElement) => {
    const style = {
      backgroundColor: element.styles.backgroundColor,
      color: element.styles.textColor,
      fontSize: element.styles.fontSize,
      padding: element.styles.padding,
      margin: element.styles.margin,
      borderRadius: element.styles.borderRadius,
      minHeight: "40px",
      cursor: "pointer",
      outline: selectedElement === element.id ? "3px solid #3b82f6" : "none",
      outlineOffset: "2px",
      transition: "all 0.2s ease",
    };

    const handleClick = () => {
      setSelectedElement(element.id);
      setShowColorPicker(null);
    };

    switch (element.type) {
      case "header":
        return (
          <h1 style={style} onClick={handleClick} className="font-bold">
            <input
              value={element.content}
              onChange={(e) => updateElementContent(element.id, e.target.value)}
              className="bg-transparent border-none outline-none w-full"
              style={{ color: element.styles.textColor }}
            />
          </h1>
        );
      case "section":
        return (
          <h2 style={style} onClick={handleClick} className="font-semibold">
            <input
              value={element.content}
              onChange={(e) => updateElementContent(element.id, e.target.value)}
              className="bg-transparent border-none outline-none w-full"
              style={{ color: element.styles.textColor }}
            />
          </h2>
        );
      case "text":
        return (
          <div style={style} onClick={handleClick}>
            <textarea
              value={element.content}
              onChange={(e) => updateElementContent(element.id, e.target.value)}
              className="bg-transparent border-none outline-none w-full resize-none"
              style={{ color: element.styles.textColor }}
              rows={3}
            />
          </div>
        );
      case "image":
        return (
          <div
            style={style}
            onClick={handleClick}
            className="flex items-center justify-center"
          >
            <input
              value={element.content}
              onChange={(e) => updateElementContent(element.id, e.target.value)}
              className="bg-transparent border-none outline-none text-center"
              style={{ color: element.styles.textColor }}
              placeholder="رابط الصورة أو النص البديل"
            />
          </div>
        );
      case "button":
        return (
          <button
            style={style}
            onClick={handleClick}
            className="px-4 py-2 rounded"
          >
            <input
              value={element.content}
              onChange={(e) => updateElementContent(element.id, e.target.value)}
              className="bg-transparent border-none outline-none"
              style={{ color: element.styles.textColor }}
            />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                محرر تخطيط الملف الشخصي
              </h1>
              <p className="text-gray-800 mt-1">
                الملف الشخصي رقم: {profileId}
              </p>
            </div>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Tools */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                أدوات التحرير
              </h3>

              {/* Add Elements */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-gray-800">إضافة عناصر</h4>
                <div className="space-y-2">
                  {[
                    {
                      type: "header" as const,
                      label: "عنوان رئيسي",
                      icon: "📝",
                    },
                    { type: "section" as const, label: "قسم", icon: "📑" },
                    { type: "text" as const, label: "نص", icon: "📄" },
                    { type: "image" as const, label: "صورة", icon: "🖼️" },
                    { type: "button" as const, label: "زر", icon: "🔘" },
                  ].map(({ type, label, icon }) => (
                    <button
                      key={type}
                      onClick={() => addElement(type)}
                      className="w-full p-3 text-right border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-800"
                    >
                      <span className="mr-2">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Element Properties */}
              {selectedElement && (
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-3 text-gray-800">
                    خصائص العنصر
                  </h4>
                  {(() => {
                    const element = getSelectedElement();
                    if (!element) return null;

                    return (
                      <div className="space-y-4">
                        {/* Color Presets */}
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-800">
                            الألوان المُقترحة
                          </label>
                          <div className="grid grid-cols-4 gap-2 mb-3">
                            {colorPresets.map((preset, index) => (
                              <button
                                key={index}
                                onClick={() =>
                                  applyColorPreset(element.id, preset)
                                }
                                className="w-8 h-8 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
                                style={{
                                  background: `linear-gradient(135deg, ${preset.bg} 50%, ${preset.text} 50%)`,
                                }}
                                title={`نسبة التباين: ${getContrastRatio(
                                  preset.bg,
                                  preset.text
                                ).toFixed(1)}:1 - خلفية: ${preset.bg}, نص: ${
                                  preset.text
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Custom Colors */}
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-800">
                            الألوان المُخصصة
                          </label>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setShowColorPicker(
                                    showColorPicker === "bg" ? null : "bg"
                                  )
                                }
                                className="w-8 h-8 rounded border-2 border-gray-300"
                                style={{
                                  backgroundColor:
                                    element.styles.backgroundColor,
                                }}
                              />
                              <span className="text-sm text-gray-800">
                                لون الخلفية
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setShowColorPicker(
                                    showColorPicker === "text" ? null : "text"
                                  )
                                }
                                className="w-8 h-8 rounded border-2 border-gray-300"
                                style={{
                                  backgroundColor: element.styles.textColor,
                                }}
                              />
                              <span className="text-sm text-gray-800">
                                لون النص
                              </span>
                            </div>
                          </div>

                          {/* Contrast Ratio Indicator */}
                          <div className="mt-2 p-2 rounded text-xs">
                            {(() => {
                              const ratio = getContrastRatio(
                                element.styles.backgroundColor,
                                element.styles.textColor
                              );
                              const isGood = hasGoodContrast(
                                element.styles.backgroundColor,
                                element.styles.textColor
                              );
                              return (
                                <div
                                  className={`flex items-center gap-2 ${
                                    isGood
                                      ? "text-green-700 bg-green-50"
                                      : "text-red-700 bg-red-50"
                                  } p-2 rounded`}
                                >
                                  <span>{isGood ? "✅" : "⚠️"}</span>
                                  <span>
                                    نسبة التباين: {ratio.toFixed(1)}:1
                                    {isGood ? " (ممتاز)" : " (يحتاج تحسين)"}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Font Size */}
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-800">
                            حجم الخط
                          </label>
                          <select
                            value={element.styles.fontSize}
                            onChange={(e) =>
                              updateElementStyle(
                                element.id,
                                "fontSize",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border rounded"
                          >
                            <option value="12px">صغير (12px)</option>
                            <option value="14px">صغير متوسط (14px)</option>
                            <option value="16px">متوسط (16px)</option>
                            <option value="18px">كبير متوسط (18px)</option>
                            <option value="20px">كبير (20px)</option>
                            <option value="24px">كبير جداً (24px)</option>
                            <option value="32px">عملاق (32px)</option>
                          </select>
                        </div>

                        {/* Spacing */}
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-800">
                            المسافات الداخلية
                          </label>
                          <select
                            value={element.styles.padding}
                            onChange={(e) =>
                              updateElementStyle(
                                element.id,
                                "padding",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border rounded"
                          >
                            <option value="4px">صغير (4px)</option>
                            <option value="8px">متوسط صغير (8px)</option>
                            <option value="12px">متوسط (12px)</option>
                            <option value="16px">كبير (16px)</option>
                            <option value="20px">كبير جداً (20px)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-800">
                            المسافات الخارجية
                          </label>
                          <select
                            value={element.styles.margin}
                            onChange={(e) =>
                              updateElementStyle(
                                element.id,
                                "margin",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border rounded"
                          >
                            <option value="0px">بدون (0px)</option>
                            <option value="4px">صغير (4px)</option>
                            <option value="8px">متوسط (8px)</option>
                            <option value="12px">كبير (12px)</option>
                            <option value="16px">كبير جداً (16px)</option>
                          </select>
                        </div>

                        {/* Border Radius */}
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-800">
                            استدارة الحواف
                          </label>
                          <select
                            value={element.styles.borderRadius}
                            onChange={(e) =>
                              updateElementStyle(
                                element.id,
                                "borderRadius",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border rounded"
                          >
                            <option value="0px">حاد (0px)</option>
                            <option value="4px">قليل (4px)</option>
                            <option value="6px">متوسط (6px)</option>
                            <option value="8px">مُدور (8px)</option>
                            <option value="12px">مُدور جداً (12px)</option>
                            <option value="16px">مُدور كثيراً (16px)</option>
                          </select>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => deleteElement(element.id)}
                          className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          حذف العنصر
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Custom Color Picker Modal */}
              {showColorPicker && selectedElement && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-4 rounded-lg">
                    <ChromePicker
                      color={
                        showColorPicker === "bg"
                          ? getSelectedElement()?.styles.backgroundColor
                          : getSelectedElement()?.styles.textColor
                      }
                      onChange={(color: ColorResult) => {
                        if (selectedElement) {
                          updateElementStyle(
                            selectedElement,
                            showColorPicker === "bg"
                              ? "backgroundColor"
                              : "textColor",
                            color.hex
                          );
                        }
                      }}
                    />
                    <button
                      onClick={() => setShowColorPicker(null)}
                      className="mt-4 w-full p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                منطقة التحرير التفاعلية
              </h3>

              {/* Drag & Drop Editor */}
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="layout-elements">
                  {(provided: DroppableProvided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4 min-h-[500px] p-4 border-2 border-dashed border-gray-200 rounded-lg"
                    >
                      {elements
                        .sort((a, b) => a.position - b.position)
                        .map((element, index) => (
                          <Draggable
                            key={element.id}
                            draggableId={element.id}
                            index={index}
                          >
                            {(
                              provided: DraggableProvided,
                              snapshot: DraggableStateSnapshot
                            ) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`relative group ${
                                  snapshot.isDragging
                                    ? "transform rotate-1 shadow-xl z-10"
                                    : "hover:shadow-md"
                                } transition-all duration-200`}
                              >
                                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                  <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg">
                                    🔄 اسحب لإعادة الترتيب
                                  </div>
                                </div>
                                {renderElement(element)}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}

                      {elements.length === 0 && (
                        <div className="text-center py-16 text-gray-700">
                          <p className="text-4xl mb-4">🎨</p>
                          <p className="text-lg font-medium mb-2 text-gray-800">
                            ابدأ بإضافة عناصر إلى تخطيطك
                          </p>
                          <p className="text-sm text-gray-700">
                            استخدم الأدوات في الشريط الجانبي لإضافة العناصر
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayoutEditor;
